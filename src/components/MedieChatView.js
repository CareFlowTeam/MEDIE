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
// .env 파일의 EXPO_PUBLIC_API_URL을 사용합니다.
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export const MedieChatView = ({ appMode, setAppMode }) => {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: '1', text: "안녕 지현님! 약 먹을 시간인가요? 멍!", isMe: false }
    ]);
    const [isListening, setIsListening] = useState(false);
    const [showConfirmButtons, setShowConfirmButtons] = useState(false);
    const [isThinking, setIsThinking] = useState(false);
    const flatListRef = useRef();

    // --- [1] 메디의 목소리 (TTS) ---
    const speakMedie = (text) => {
        Speech.speak(text, { language: 'ko-KR', pitch: 1.1, rate: 1.0 });
    };

    // --- [2] 음성 인식 결과 처리 (STT) ---
    useSpeechRecognitionEvent("result", (event) => {
        const transcript = event.results[0]?.transcript;
        if (transcript) {
            console.log("인식된 문장:", transcript);
            // 인식이 완료되면 자동으로 중지하고 서버로 전송
            handleStopListening();
            askMedie(transcript);
        }
    });

    useSpeechRecognitionEvent("error", (event) => {
        console.log("음성인식 에러:", event.error, event.message);
        setIsListening(false);
    });

    // --- [3] 마이크 제어 함수 ---
    const handleStartListening = async () => {
        try {
            // iOS/Android 권한 요청
            const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
            if (!result.granted) {
                Alert.alert("권한 거부", "마이크 권한이 필요합니다. 설정에서 허용해주세요!");
                return;
            }

            setIsListening(true);
            // 한국어 설정으로 음성 인식 시작
            await ExpoSpeechRecognitionModule.start({
                lang: "ko-KR",
                interimResults: true,
            });
        } catch (e) {
            console.error("마이크 시작 실패:", e);
        }
    };

    const handleStopListening = async () => {
        await ExpoSpeechRecognitionModule.stop();
        setIsListening(false);
    };

    // --- [4] 메디 서버와 통신 (Azure AI Agent) ---
    const askMedie = async (userText) => {
        if (!isChatOpen) setIsChatOpen(true);

        const newUserMsg = { id: Date.now().toString(), text: userText, isMe: true };
        setMessages(prev => [...prev, newUserMsg]);
        setIsThinking(true);

        try {
            console.log("서버 요청 주소:", `${API_BASE_URL}/chat`);
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

            // 메디의 답장 읽어주기
            speakMedie(data.reply);

            // 서버 명령 처리 (화면 이동 등)
            if (data.show_confirmation) setShowConfirmButtons(true);
            if (data.command === "MOVE_SCREEN" && data.target) {
                setAppMode(data.target);
            }

        } catch (e) {
            console.error("서버 연결 실패:", e);
            Alert.alert("연결 오류", "메디 서버와 연결할 수 없어요. 주소를 확인해주세요!");
        } finally {
            setIsThinking(false);
        }
    };

    // --- [5] 플로팅 버튼 클릭 로직 ---
    const handleFloatingBtnPress = () => {
        if (!isChatOpen) {
            // 1. 채팅창이 닫혀있으면 연다.
            setIsChatOpen(true);
        } else {
            // 2. 채팅창이 열려있을 때 누르면 음성 인식을 시작/중지한다.
            if (isListening) {
                handleStopListening();
            } else {
                handleStartListening();
            }
        }
    };

    return (
        <View style={styles.masterContainer} pointerEvents="box-none">
            {/* 채팅 팝업창 */}
            {isChatOpen && (
                <View style={styles.chatPopup}>
                    <View style={styles.chatHeader}>
                        <Text style={styles.headerTitle}>매디와 대화 중 🐶</Text>
                        <TouchableOpacity onPress={() => {
                            setIsChatOpen(false);
                            if (isListening) handleStopListening();
                        }}>
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

                    {showConfirmButtons && (
                        <View style={styles.confirmBox}>
                            <TouchableOpacity style={styles.yesBtn} onPress={() => {
                                setShowConfirmButtons(false);
                                askMedie("응 먹었어!");
                            }}>
                                <Text style={styles.btnText}>응, 먹었어! 💊</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            )}

            {/* 메디 플로팅 버튼 */}
            <TouchableOpacity
                style={[
                    styles.medieFloatingBtn,
                    isListening && styles.listeningBtn // 듣고 있을 때 스타일 변경
                ]}
                onPress={handleFloatingBtnPress}
            >
                {isThinking ? (
                    <ActivityIndicator color="#FF7F50" />
                ) : (
                    <Image
                        source={require('../../assets/medie-dog.png')}
                        style={[styles.medieIcon, isListening && { opacity: 0.7 }]}
                    />
                )}
                {isListening && <View style={styles.activeDot} />}
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    masterContainer: { ...StyleSheet.absoluteFillObject, zIndex: 999 },
    chatPopup: {
        position: 'absolute', bottom: 120, right: 20, width: width * 0.85, height: 450,
        backgroundColor: '#FFF', borderRadius: 25, elevation: 10, shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.3, shadowRadius: 5, overflow: 'hidden'
    },
    chatHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 18, backgroundColor: '#F9F9F9', borderBottomWidth: 1, borderBottomColor: '#EEE' },
    headerTitle: { fontWeight: 'bold', color: '#333' },
    closeBtn: { color: '#FF7F50', fontWeight: 'bold' },
    chatList: { padding: 15 },
    bubble: { padding: 12, borderRadius: 18, marginVertical: 5, maxWidth: '80%' },
    myBubble: { alignSelf: 'flex-end', backgroundColor: '#FF7F50' },
    medieBubble: { alignSelf: 'flex-start', backgroundColor: '#F0F0F0', borderBottomLeftRadius: 2 },
    myText: { color: '#FFF', fontSize: 15 },
    medieText: { color: '#333', fontSize: 15 },
    confirmBox: { padding: 15, borderTopWidth: 1, borderTopColor: '#EEE' },
    yesBtn: { backgroundColor: '#4CAF50', padding: 15, borderRadius: 12, alignItems: 'center' },
    btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
    medieFloatingBtn: {
        position: 'absolute', bottom: 30, right: 20, backgroundColor: '#FFF',
        borderRadius: 45, padding: 5, elevation: 8, borderWidth: 3, borderColor: '#FF7F50',
        width: 85, height: 85, justifyContent: 'center', alignItems: 'center'
    },
    listeningBtn: { borderColor: '#4CAF50', transform: [{ scale: 1.1 }] },
    medieIcon: { width: 70, height: 70 },
    activeDot: {
        position: 'absolute', top: 5, right: 5, width: 20, height: 20,
        borderRadius: 10, backgroundColor: '#4CAF50', borderWidth: 3, borderColor: '#FFF'
    }
});