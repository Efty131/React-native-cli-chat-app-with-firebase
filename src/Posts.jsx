import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Button, Alert, Image } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { useSelector } from 'react-redux';

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [commentInput, setCommentInput] = useState({});
  const [visibleCommentInputs, setVisibleCommentInputs] = useState({});
  const currentUserUid = auth().currentUser?.uid;

  const isNightMode = useSelector((state) => state.theme.isNightMode);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const postsSnapshot = await firestore()
          .collection('posts')
          .orderBy('createdAt', 'desc')
          .get();
        const fetchedPosts = postsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setPosts(fetchedPosts);
      } catch (error) {
        console.error('Error fetching posts:', error);
        Alert.alert('Error', 'Failed to fetch posts.');
      }
    };

    fetchPosts();
  }, []);

  const handleAddPost = async () => {
    if (newPostContent.trim() === '') {
      Alert.alert('Error', 'Post content cannot be empty.');
      return;
    }

    try {
      const currentUser = auth().currentUser;
      const userName = currentUser.displayName || 'Anonymous';
      const userPhotoURL = currentUser.photoURL || 'https://via.placeholder.com/150';

      await firestore().collection('posts').add({
        userId: currentUserUid,
        userName: userName,
        userPhotoURL: userPhotoURL,
        content: newPostContent,
        createdAt: firestore.FieldValue.serverTimestamp(),
        likedBy: [],
        comments: [],
      });

      setNewPostContent('');
      Alert.alert('Success', 'Post added successfully!');
    } catch (error) {
      console.error('Error adding post:', error);
      Alert.alert('Error', 'Failed to add post.');
    }
  };

  const handleLike = async (postId, isLiked) => {
    try {
      const postRef = firestore().collection('posts').doc(postId);

      if (isLiked) {
        await postRef.update({
          likedBy: firestore.FieldValue.arrayRemove(currentUserUid),
        });
      } else {
        await postRef.update({
          likedBy: firestore.FieldValue.arrayUnion(currentUserUid),
        });
      }

      const updatedPost = await postRef.get();
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId ? { ...post, likedBy: updatedPost.data().likedBy } : post
        )
      );
    } catch (error) {
      console.error('Error updating like:', error);
      Alert.alert('Error', 'Failed to update like.');
    }
  };

  const handleAddComment = async (postId) => {
    const commentText = commentInput[postId];
    if (!commentText || commentText.trim() === '') {
      Alert.alert('Error', 'Comment cannot be empty.');
      return;
    }

    try {
      const currentUser = auth().currentUser;
      const userName = currentUser.displayName || 'Anonymous';
      const userPhotoURL = currentUser.photoURL || 'https://via.placeholder.com/150';

      const postRef = firestore().collection('posts').doc(postId);

      await postRef.update({
        comments: firestore.FieldValue.arrayUnion({
          userId: currentUserUid,
          userName: userName,
          userPhotoURL: userPhotoURL,
          text: commentText,
          createdAt: new Date().toISOString(),
        }),
      });

      const updatedPost = await postRef.get();
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId ? { ...post, comments: updatedPost.data().comments } : post
        )
      );

      setCommentInput((prevInput) => ({ ...prevInput, [postId]: '' }));
    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert('Error', 'Failed to add comment.');
    }
  };

  const toggleCommentSection = (postId) => {
    setVisibleCommentInputs((prevVisible) => ({
      ...prevVisible,
      [postId]: !prevVisible[postId],
    }));
  };

  const renderPost = ({ item }) => {
    const isLiked = item.likedBy?.includes(currentUserUid);
    const likeCount = item.likedBy?.length || 0;

    return (
      <View
        className={`p-4 mb-3 rounded-lg shadow ${
          isNightMode ? 'bg-gray-800' : 'bg-gray-100'
        }`}
      >
        <View className="flex-row items-center mb-2">
          <Image
            source={{ uri: item.userPhotoURL }}
            className="w-12 h-12 rounded-full mr-4"
          />
          <View>
            <Text
              className={`font-semibold ${
                isNightMode ? 'text-gray-100' : 'text-gray-800'
              }`}
            >
              {item.userName || 'User'}
            </Text>
            <Text className={`text-xs font-bold ${isNightMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {new Date(item.createdAt?.toDate()).toLocaleString()}
            </Text>
          </View>
        </View>
        <Text className={`mb-2 ${isNightMode ? 'text-gray-200' : 'text-gray-900'}`}>
          {item.content}
        </Text>
        <View className="flex-row justify-between items-center mt-2">
          <TouchableOpacity
            onPress={() => handleLike(item.id, isLiked)}
            className={`p-2 rounded ${
              isLiked
                ? isNightMode
                  ? 'bg-blue-800 border-blue-400'
                  : 'bg-blue-100 border-blue-600'
                : 'border-gray-400'
            }`}
          >
            <Text className={isLiked ? 'text-blue-400 font-bold' : 'text-gray-400'}>
              Like ({likeCount})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => toggleCommentSection(item.id)}>
            <Text className={`font-bold ${isNightMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Comment
            </Text>
          </TouchableOpacity>
        </View>
        {visibleCommentInputs[item.id] && (
          <View className="mt-2">
            <FlatList
              data={item.comments}
              keyExtractor={(comment, index) => `${item.id}-comment-${index}`}
              renderItem={({ item: comment }) => (
                <View
                  className={`flex-row items-center p-2 mt-2 rounded ${
                    isNightMode ? 'bg-gray-700' : 'bg-gray-200'
                  }`}
                >
                  <Image
                    source={{ uri: comment.userPhotoURL }}
                    className="w-8 h-8 rounded-full mr-2"
                  />
                  <View>
                    <Text
                      className={`text-sm font-semibold ${
                        isNightMode ? 'text-gray-200' : 'text-gray-800'
                      }`}
                    >
                      {comment.userName}
                    </Text>
                    <Text className={`text-xs ${isNightMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {new Date(comment.createdAt).toLocaleString()}
                    </Text>
                    <Text className={`text-sm ${isNightMode ? 'text-gray-200' : 'text-gray-800'}`}>
                      {comment.text}
                    </Text>
                  </View>
                </View>
              )}
            />
            <TextInput
              className={`p-2 border rounded mt-2 ${
                isNightMode ? 'border-gray-600 bg-gray-900 text-gray-200' : 'border-gray-300'
              }`}
              placeholder="Write a comment..."
              placeholderTextColor={isNightMode ? 'gray' : undefined}
              value={commentInput[item.id] || ''}
              onChangeText={(text) =>
                setCommentInput((prevInput) => ({ ...prevInput, [item.id]: text }))
              }
            />
            <Button
              title="Add Comment"
              onPress={() => handleAddComment(item.id)}
              color={isNightMode ? 'gray' : undefined}
            />
          </View>
        )}
      </View>
    );
  };

  return (
    <View className={`flex-1 p-5 ${isNightMode ? 'bg-gray-900' : 'bg-white'}`}>
      <View className="mb-5">
        <TextInput
          className={`p-2 border rounded ${
            isNightMode ? 'border-gray-600 bg-gray-800 text-gray-200' : 'border-gray-300'
          }`}
          placeholder="What's on your mind?"
          placeholderTextColor={isNightMode ? 'gray' : undefined}
          value={newPostContent}
          onChangeText={setNewPostContent}
        />
        <Button
          title="Add Post"
          onPress={handleAddPost}
          color={isNightMode ? 'gray' : undefined}
        />
      </View>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderPost}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text className={`text-center ${isNightMode ? 'text-gray-400' : 'text-gray-500'}`}>
            No posts yet.
          </Text>
        }
      />
    </View>
  );
};

export default Posts;