import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    FlatList,
    Alert,
    ActivityIndicator
} from 'react-native';
import * as Speech from 'expo-speech';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from "expo-speech-recognition";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export const MedieChatView = ({ appMode, setAppMode }) => {
    const [messages, setMessages] = useState([
        { id: '1', text: "안녕 지현님! 약 먹을 시간인가요? 멍!", isMe: false }
    ]);
    const [isListening, setIsListening] = useState(false);
    const [showConfirmButtons, setShowConfirmButtons] = useState(false);
    const [isThinking, setIsThinking] = useState(false);
    const flatListRef = useRef();

    /** 🔊 TTS */
    const speakMedie = (text) => {
        Speech.speak(text, { language: 'ko-KR', pitch: 1.1, rate: 1.0 });
    };

    /** 🎙️ 음성 인식 (STT) */
    useSpeechRecognitionEvent("result", (event) => {
        const transcript = event.results[0]?.transcript;
        if (transcript.includes("메디야") || transcript.includes("매디야")) {
            const cleanText = transcript.replace(/메디야|매디야/g, "").trim();
            if (cleanText.length > 0) askMedie(cleanText);
            else speakMedie("네, 듣고 있어요!");
        }
    });

    /** 🤖 에이전트 통신 (LangGraph 기반) */
    const askMedie = async (userText) => {
        // 1. 내 메시지 추가
        const newUserMsg = { id: Date.now().toString(), text: userText, isMe: true };
        setMessages(prev => [...prev, newUserMsg]);
        setIsThinking(true);

        try {
            const response = await fetch(`${API_BASE_URL}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_input: userText,
                    current_mode: appMode
                }),
            });

            const data = await response.json();

            // 2. 메디 응답 추가
            const medieReply = { id: (Date.now() + 1).toString(), text: data.reply, isMe: false };
            setMessages(prev => [...prev, medieReply]);

            // 3. 상태 제어
            speakMedie(data.reply);
            if (data.show_confirmation) setShowConfirmButtons(true);
            if (data.command === "MOVE_SCREEN" && data.target) setAppMode(data.target);

        } catch (e) {
            Alert.alert("연결 오류", "메디가 잠시 자러 갔나봐요 멍.");
        } finally {
            setIsThinking(false);
        }
    };

    return (
        <View style={styles.overlayContainer} pointerEvents="box-none">
            {/* 1. 채팅창 (평소엔 안보이다가 메시지 쌓이면 보이게 하거나 고정) */}
            <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <View style={[styles.bubble, item.isMe ? styles.myBubble : styles.medieBubble]}>
                        <Text style={item.isMe ? styles.myText : styles.medieText}>{item.text}</Text>
                    </View>
                )}
                style={styles.chatArea}
                onContentSizeChange={() => flatListRef.current.scrollToEnd()}
            />

            {/* 2. 확인 버튼 (LangGraph Human-in-the-Loop) */}
            {showConfirmButtons && (
                <View style={styles.confirmBox}>
                    <TouchableOpacity style={styles.yesBtn} onPress={() => { setShowConfirmButtons(false); askMedie("응 먹었어!"); }}>
                        <Text style={styles.btnText}>응, 먹었어! 💊</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.noBtn} onPress={() => setShowConfirmButtons(false)}>
                        <Text style={styles.btnText}>아니</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* 3. 메디 버튼 */}
            <TouchableOpacity style={styles.medieBtn} onPress={() => askMedie("안녕 메디!")}>
                {isThinking ? <ActivityIndicator color="#FF7F50" /> : <Image source={require('../../assets/medie-dog.png')} style={styles.medieIcon} />}
                {isListening && <View style={styles.dot} />}
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    overlayContainer: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end', padding: 20 },
    chatArea: { maxHeight: '40%', marginBottom: 10 },
    bubble: { padding: 12, borderRadius: 15, marginVertical: 5, maxWidth: '80%' },
    myBubble: { alignSelf: 'flex-end', backgroundColor: '#4A90E2' },
    medieBubble: { alignSelf: 'flex-start', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#EEE' },
    myText: { color: '#FFF' },
    medieText: { color: '#333' },
    confirmBox: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20 },
    yesBtn: { backgroundColor: '#4CAF50', padding: 15, borderRadius: 10, marginRight: 10 },
    noBtn: { backgroundColor: '#FF5252', padding: 15, borderRadius: 10 },
    btnText: { color: '#FFF', fontWeight: 'bold' },
    medieBtn: { alignSelf: 'flex-end', backgroundColor: '#FFF', borderRadius: 40, padding: 10, elevation: 5 },
    medieIcon: { width: 60, height: 60 },
    dot: { position: 'absolute', top: 5, right: 5, width: 12, height: 12, borderRadius: 6, backgroundColor: '#FF7F50' }
});