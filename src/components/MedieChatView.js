import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    FlatList,
    Alert,
    ActivityIndicator,
    Dimensions
} from 'react-native';
import * as Speech from 'expo-speech';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from "expo-speech-recognition";

const { width } = Dimensions.get('window');
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export const MedieChatView = ({ appMode, setAppMode }) => {
    const [isChatOpen, setIsChatOpen] = useState(false); // 👈 토글 상태 추가
    const [messages, setMessages] = useState([
        { id: '1', text: "안녕 지현님! 약 먹을 시간인가요? 멍!", isMe: false }
    ]);
    const [isListening, setIsListening] = useState(false);
    const [showConfirmButtons, setShowConfirmButtons] = useState(false);
    const [isThinking, setIsThinking] = useState(false);
    const flatListRef = useRef();

    // ... (speakMedie, useSpeechRecognitionEvent 함수는 그대로 유지) ...

    const askMedie = async (userText) => {
        if (!isChatOpen) setIsChatOpen(true); // 메시지가 오면 자동으로 창 열기

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
            const medieReply = { id: (Date.now() + 1).toString(), text: data.reply, isMe: false };
            setMessages(prev => [...prev, medieReply]);

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
        // pointerEvents="box-none"은 이 컨테이너 자체는 터치를 안 막고 자식 요소만 터치되게 함
        <View style={styles.masterContainer} pointerEvents="box-none">

            {/* 1. 토글형 채팅 팝업 */}
            {isChatOpen && (
                <View style={styles.chatPopup}>
                    <View style={styles.chatHeader}>
                        <Text style={styles.headerTitle}>매디와 대화 중 🐶</Text>
                        <TouchableOpacity onPress={() => setIsChatOpen(false)}>
                            <Text style={styles.closeBtn}>닫기</Text>
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => (
                            <View style={[styles.bubble, item.isMe ? styles.myBubble : styles.medieBubble]}>
                                <Text style={item.isMe ? styles.myText : styles.medieText}>{item.text}</Text>
                            </View>
                        )}
                        style={styles.chatList}
                        onContentSizeChange={() => flatListRef.current.scrollToEnd()}
                    />

                    {/* Human-in-the-Loop 확인 버튼 */}
                    {showConfirmButtons && (
                        <View style={styles.confirmBox}>
                            <TouchableOpacity style={styles.yesBtn} onPress={() => { setShowConfirmButtons(false); askMedie("응 먹었어!"); }}>
                                <Text style={styles.btnText}>응, 먹었어! 💊</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            )}

            {/* 2. 메디 플로팅 버튼 (이건 항상 보임) */}
            <TouchableOpacity
                style={styles.medieFloatingBtn}
                onPress={() => setIsChatOpen(!isChatOpen)}
            >
                {isThinking ? (
                    <ActivityIndicator color="#FF7F50" />
                ) : (
                    <Image source={require('../../assets/medie-dog.png')} style={styles.medieIcon} />
                )}
                {isListening && <View style={styles.activeDot} />}
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    masterContainer: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 999,
    },
    chatPopup: {
        position: 'absolute',
        bottom: 110, // 버튼보다 위로
        right: 20,
        width: width * 0.8,
        height: 400,
        backgroundColor: '#FFF',
        borderRadius: 20,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        overflow: 'hidden'
    },
    chatHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 15,
        backgroundColor: '#F8F8F8',
        borderBottomWidth: 1,
        borderBottomColor: '#EEE'
    },
    headerTitle: { fontWeight: 'bold', color: '#555' },
    closeBtn: { color: '#FF7F50', fontWeight: 'bold' },
    chatList: { padding: 10 },
    bubble: { padding: 10, borderRadius: 15, marginVertical: 4, maxWidth: '85%' },
    myBubble: { alignSelf: 'flex-end', backgroundColor: '#FF7F50' },
    medieBubble: { alignSelf: 'flex-start', backgroundColor: '#F0F0F0' },
    myText: { color: '#FFF' },
    medieText: { color: '#333' },
    confirmBox: { padding: 10, borderTopWidth: 1, borderTopColor: '#EEE' },
    yesBtn: { backgroundColor: '#4CAF50', padding: 12, borderRadius: 10, alignItems: 'center' },
    btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
    medieFloatingBtn: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        backgroundColor: '#FFF',
        borderRadius: 40,
        padding: 5,
        elevation: 5,
        borderWidth: 2,
        borderColor: '#FF7F50'
    },
    medieIcon: { width: 70, height: 70 },
    activeDot: { position: 'absolute', top: 5, right: 5, width: 15, height: 15, borderRadius: 8, backgroundColor: '#FF7F50' }
});