import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import useGetUserProfile from '@/hooks/useGetUserProfile';
import { Link, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { AtSign, Heart, MessageCircle, Camera } from 'lucide-react';

const Profile = () => {
  const params = useParams();
  const userId = params.id;
  useGetUserProfile(userId);
  const [activeTab, setActiveTab] = useState('posts');
  const { userProfile, user } = useSelector(store => store.auth);
  const isLoggedInUserProfile = user?._id === userProfile?._id;
  const isFriends = false;

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const displayedPost = activeTab === 'posts' ? userProfile?.posts || [] : userProfile?.saved || [];

  return (
    <div className='flex flex-col items-center w-full h-screen flex-grow bg-gray-100'>
      {/* Cover Photo */}
      <div className='relative w-full h-[60%] '>
        <img src={userProfile?.coverPhoto} alt='cover' className='w-[80%] h-[100%] object-center ml-[10%] rounded-lg' />
        {isLoggedInUserProfile && (
          <button className='absolute bottom-4 right-4 bg-white p-2 rounded-full shadow-md'>
            <Camera size={20} />
          </button>
        )}
      </div>

      {/* Profile Section */}
      <div className='flex flex-col w-full max-w-5xl bg-white p-6 shadow-md -mt-16 rounded-lg'>
        <Avatar className='h-32 w-32 border-4 border-white shadow-lg'>
          <AvatarImage src={userProfile?.profilePicture} alt='profile' />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <h2 className='text-2xl font-bold mt-2'>{userProfile?.username}</h2>
        <p className='text-gray-500'>{userProfile?.friends?.length} friends</p>
        <div className='mt-4 flex gap-2'>
          {isLoggedInUserProfile ? (
            <>
              <Link to='/account/edit'><Button variant='secondary'>Edit Profile</Button></Link>
              <Button variant='secondary'>View Archive</Button>
            </>
          ) : (
            isFriends ? (
              <Button variant='secondary'>Unfriend</Button>
            ) : (
              <Button className='bg-blue-500 text-white'>Add friend</Button>
            )
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className='w-full max-w-5xl mt-6'>
        <div className='flex justify-center gap-10 border-b py-3 text-gray-600'>
          {['posts', 'about', 'friends', 'photos', 'videos'].map(tab => (
            <span 
              key={tab} 
              className={`cursor-pointer ${activeTab === tab ? 'font-bold border-b-2 border-black' : ''}`} 
              onClick={() => handleTabChange(tab)}
            >
              {tab.toUpperCase()}
            </span>
          ))}
        </div>
      </div>

      {/* Posts Section */}
      <div className='grid grid-cols-3 gap-4 max-w-5xl mt-6'>
        {displayedPost.map(post => (
          <div key={post._id} className='relative group cursor-pointer'>
            <img src={post.image} alt='post' className='rounded-md w-full aspect-square object-cover' />
            <div className='absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity'>
              <div className='flex items-center text-white space-x-4'>
                <button className='flex items-center gap-2'><Heart /><span>{post.reactions.length}</span></button>
                <button className='flex items-center gap-2'><MessageCircle /><span>{post.comments.length}</span></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Profile;
