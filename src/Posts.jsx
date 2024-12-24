import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Button, Alert, Image } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [commentInput, setCommentInput] = useState({});
  const [visibleCommentInputs, setVisibleCommentInputs] = useState({});
  const currentUserUid = auth().currentUser?.uid;

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
      <View className="p-4 mb-3 bg-gray-100 rounded-lg shadow">
        <View className="flex-row items-center mb-2">
          <Image
            source={{ uri: item.userPhotoURL }}
            className="w-12 h-12 rounded-full mr-4"
          />
          <View>
            <Text className="font-semibold text-gray-800">{item.userName || 'User'}</Text>
            <Text className="text-xs text-gray-400 font-bold">
              {new Date(item.createdAt?.toDate()).toLocaleString()}
            </Text>
          </View>
        </View>
        <Text className="text-gray-900 mb-2 font-bold">{item.content}</Text>
        <View className="flex-row justify-between items-center mt-2">
          <TouchableOpacity
            onPress={() => handleLike(item.id, isLiked)}
            style={{
              backgroundColor: isLiked ? 'lightblue' : 'white',
              borderColor: isLiked ? 'blue' : 'gray',
              borderWidth: 1,
              padding: 5,
              borderRadius: 5,
            }}
          >
            <Text
              style={{
                color: isLiked ? 'blue' : 'gray',
                fontWeight: isLiked ? 'bold' : 'normal',
              }}
            >
              Like ({likeCount})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => toggleCommentSection(item.id)}>
            <Text style={{ color: 'gray', fontWeight: 'bold' }}>Comment</Text>
          </TouchableOpacity>
        </View>
        {visibleCommentInputs[item.id] && (
          <View className="mt-2">
            <FlatList
              data={item.comments}
              keyExtractor={(comment, index) => `${item.id}-comment-${index}`}
              renderItem={({ item: comment }) => (
                <View className="flex-row items-center p-2 mt-2 bg-gray-200 rounded">
                  <Image
                    source={{ uri: comment.userPhotoURL }}
                    className="w-8 h-8 rounded-full mr-2"
                  />
                  <View>
                    <Text className="text-sm font-semibold text-gray-800">{comment.userName}</Text>
                    <Text className="text-xs text-gray-500">
                      {new Date(comment.createdAt).toLocaleString()}
                    </Text>
                    <Text className="text-sm text-gray-800">{comment.text}</Text>
                  </View>
                </View>
              )}
            />
            <TextInput
              className="p-2 border rounded mt-2"
              placeholder="Write a comment..."
              value={commentInput[item.id] || ''}
              onChangeText={(text) =>
                setCommentInput((prevInput) => ({ ...prevInput, [item.id]: text }))
              }
            />
            <Button title="Add Comment" onPress={() => handleAddComment(item.id)} />
          </View>
        )}
      </View>
    );
  };

  return (
    <View className="flex-1 bg-white p-5">
      <View className="mb-5">
        <TextInput
          className="p-2 border rounded"
          placeholder="What's on your mind?"
          value={newPostContent}
          onChangeText={setNewPostContent}
        />
        <Button title="Add Post" onPress={handleAddPost} />
      </View>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderPost}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text className="text-center text-gray-500">No posts yet.</Text>}
      />
    </View>
  );
};

export default Posts;