import { useState, useEffect } from "react";
import { StyleSheet, View, Platform, KeyboardAvoidingView } from "react-native";
import { Bubble, GiftedChat, InputToolbar } from "react-native-gifted-chat";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CustomActions from "./CustomActions";
import MapView from "react-native-maps"; 

const Chat = ({ route, navigation, db, isConnected, storage }) => {
  const [messages, setMessages] = useState([]);
  const { userID, name, color } = route.params;

  useEffect(() => {
    navigation.setOptions({ title: name });

    let unsubscribe; // Stores the Firestore listener to clean up later

    const loadCachedMessages = async () => {
      try {
        const cachedMessages = await AsyncStorage.getItem("messages");
        if (cachedMessages) {
          setMessages(JSON.parse(cachedMessages));
        }
      } catch (error) {
        console.error("Failed to load messages from cache:", error);
      }
    };

    if (isConnected) {
      // Firestore query: fetch messages ordered by timestamp (newest first)
      const messagesQuery = query(collection(db, "messages"), orderBy("createdAt", "desc"));

      unsubscribe = onSnapshot(messagesQuery, async (snapshot) => {
        const messagesList = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            _id: doc.id, // Firebase document ID as message _id
            ...data,
            createdAt: data.createdAt ? data.createdAt.toDate() : new Date(), // Convert Firestore timestamp
            user: {
              _id: data.user?._id || 'system', // fallback to 'system' if user is missing
              name: data.user?.name || 'System',
            },
            image: data.image || null,
            location: data.location || null,
          };
        });

        setMessages(messagesList);

        // Cache messages locally for offline access
        try {
          await AsyncStorage.setItem("messages", JSON.stringify(messagesList));
        } catch (error) {
          console.error("Failed to cache messages:", error);
        }
      });
    } else {
      loadCachedMessages(); // Load cached messages if offline
    }

    return () => {
      if (unsubscribe) unsubscribe(); // Clean up Firestore listener
    };
  }, [db, isConnected, name, navigation]);

  const onSend = (newMessages) => {
    if (isConnected) {
      // Store message in Firestore with a server-generated timestamp
      addDoc(collection(db, "messages"), {
        ...newMessages[0], 
        createdAt: serverTimestamp(), // Firestore timestamp instead of local time
        user: {
          _id: userID,
          name: name,
        }
      });
    } else {
      alert("You're offline. Messages will be sent when you're back online.");
    }
  };

  const renderBubble = (props) => (
    <Bubble
      {...props}
      wrapperStyle={{
        right: { backgroundColor: "#000" }, // Customize bubble colors
        left: { backgroundColor: "#FFF" },
      }}
    />
  );

  // Hide input field when offline to prevent unsent messages
  const renderInputToolbar = (props) => {
    if (isConnected) return <InputToolbar {...props} />;
    return null;
  };

  // Custom action button (e.g., image upload, location sharing)
  const renderCustomActions = (props) => {
    return <CustomActions {...props} onSend={onSend} storage={storage} userID={userID} name={name}/>;
  };
  
  // Check if message contains a location object and render a map
  const renderCustomView = (props) => {
    const { currentMessage } = props;
    if (currentMessage.location) {
      return (
        <MapView
          style={styles.mapView}
          region={{
            latitude: currentMessage.location.latitude,
            longitude: currentMessage.location.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        />
      );
    }
    return null;
  };

  return (
    <View style={[styles.container, { backgroundColor: color }]}>
      <GiftedChat
        messages={messages}
        renderBubble={renderBubble}
        renderInputToolbar={renderInputToolbar}
        renderActions={renderCustomActions} 
        renderCustomView={renderCustomView} 
        onSend={(messages) => onSend(messages)}
        user={{
          _id: userID,
          name: name,
        }}
      />
      {/* Keyboard behavior adjustments for different platforms */}
      {Platform.OS === "android" ? <KeyboardAvoidingView behavior="height" /> : null}
      {Platform.OS === "ios" ? <KeyboardAvoidingView behavior="padding" /> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  mapView: { width: 200, height: 150, borderRadius: 10, margin: 5 },
});

export default Chat;