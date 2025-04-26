import React from "react";
import { TouchableOpacity, Text, View, StyleSheet, Alert } from "react-native";
import PropTypes from "prop-types";
import { useActionSheet } from "@expo/react-native-action-sheet";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const CustomActions = ({ wrapperStyle, iconTextStyle, onSend, storage, userID, name }) => {
  const actionSheet = useActionSheet();

  const generateReference = (uri) => {
    const timeStamp = (new Date()).getTime();
    const imageName = uri.split("/")[uri.split("/").length - 1];
    return `${userID}-${timeStamp}-${imageName}`;
  }

  const uploadAndSendImage = async (imageURI) => {
    try {
      const uniqueRefString = generateReference(imageURI);
      const newUploadRef = ref(storage, uniqueRefString);
  
      const response = await fetch(imageURI);
      const blob = await response.blob();
  
      // Ensure the file is uploaded before proceeding
      await uploadBytes(newUploadRef, blob);
  
      // Retrieve the image URL after upload completes
      const imageURL = await getDownloadURL(newUploadRef);
      
      onSend([
        {
          _id: Math.round(Math.random() * 1000000), // Ensure unique ID
          createdAt: new Date(),
          user: {
            _id: userID,
            name: name,
          },
          image: imageURL, // Correct field for GiftedChat image messages
        },
      ]);
    } catch (error) {
      console.error("Image upload failed:", error);
      Alert.alert("Failed to upload image.");
    }
  };
  

  const pickImage = async () => {
    let permissions = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissions.granted) {
      Alert.alert("Permission to access media library is required!");
      return;
    }
  
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
  
    if (!result.canceled) {
      await uploadAndSendImage(result.assets[0].uri);
    }
  };
  

  const takePhoto = async () => {
    let permissions = await ImagePicker.requestCameraPermissionsAsync();
    if (permissions?.granted) {
      let result = await ImagePicker.launchCameraAsync();
      if (!result.canceled) await uploadAndSendImage(result.assets[0].uri);
      else Alert.alert("Permissions haven't been granted.");
    }
  }
  
  // Get the user's current location and send it
  const getLocation = async () => {
    let permissions = await Location.requestForegroundPermissionsAsync();
    if (permissions.granted) {
      const location = await Location.getCurrentPositionAsync({});
      if (location) {
        onSend([
          {
            _id: Math.round(Math.random() * 1000000),
            createdAt: new Date(),
            user: {
              _id: userID, 
              name: name,
            },
            location: {
              longitude: location.coords.longitude,
              latitude: location.coords.latitude,
            },
          },
        ]);
      } else {
        Alert.alert("Error occurred while fetching location");
      }
    } else {
      Alert.alert("Permissions haven't been granted.");
    }
  };
  

  // Display the action sheet with options
  const onActionPress = () => {
    const options = ["Choose From Library", "Take Picture", "Send Location", "Cancel"];
    const cancelButtonIndex = options.length - 1;

    actionSheet.showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
      },
      async (buttonIndex) => {
        switch (buttonIndex) {
          case 0:
            pickImage();
            return;
          case 1:
            takePhoto();
            return;
          case 2:
            getLocation();
            return;
          default:
            return;
        }
      }
    );
  };

  return (
    <TouchableOpacity style={[styles.container, wrapperStyle]} onPress={onActionPress}>
      <View style={[styles.wrapper]}>
        <Text style={[styles.iconText, iconTextStyle]}>+</Text>
      </View>
    </TouchableOpacity>
  );
};

// Define PropTypes for better type safety
CustomActions.propTypes = {
  wrapperStyle: PropTypes.object,
  iconTextStyle: PropTypes.object,
  onSend: PropTypes.func.isRequired, // Ensure onSend is required
};

// Styles for the button
const styles = StyleSheet.create({
  container: {
    width: 26,
    height: 26,
    marginLeft: 10,
    marginBottom: 10,
  },
  wrapper: {
    borderRadius: 13,
    borderColor: "#b2b2b2",
    borderWidth: 2,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  iconText: {
    color: "#b2b2b2",
    fontWeight: "bold",
    fontSize: 10,
    backgroundColor: "transparent",
    textAlign: "center",
  },
});

export default CustomActions;