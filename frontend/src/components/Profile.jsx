import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Link, useNavigate, useParams } from "react-router-dom";
import blankcover from "../assets/blankcoverpic.png";
import { RiDeleteBin6Line } from "react-icons/ri";
import blankprofilepic from "../assets/blankprofilepic.png";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "./ui/button";
import { IoBookmarkOutline } from "react-icons/io5";
import { Camera, MoreHorizontal } from "lucide-react";
import Post from "./Post";
import EditProfile from "./EditProfile";
import CreatePost from "./CreatePost";
import axios from "axios";
import { toast } from "sonner";
import useGetUserProfile from "@/hooks/useGetUserProfile";
import { BACKEND_URL } from "../../configURL";
import { setPosts, setSelectedPost } from "@/redux/postSlice";
import { setAuthUser, setUserProfile } from "@/redux/authSlice";

const Profile = () => {
  const navigate = useNavigate();
  const params = useParams();
  const userId = params.id;
  useGetUserProfile(userId);
  const [activeTab, setActiveTab] = useState("posts");
  const { userProfile, user } = useSelector((store) => store.auth);
  const { posts = [], selectedPost } = useSelector((store) => store.post);
  const isLoggedInUserProfile = user?._id === userProfile?._id;
  const [displayTab, setDisplayTab] = useState([]);
  const [bio, SetBio] = useState("");
  const [threeDot, setThreeDot] = useState(false);
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  console.log(isLoggedInUserProfile);

  let isFriend = user?.friends?.includes(userId);

  useEffect(() => {
    setDisplayTab(userProfile?.posts || []);
    // if (user._id === userProfile._id) {
    //   setActiveTab((prevTab) => prevTab || "saved");
    // } else {
    //   setActiveTab("posts");
    // }
  }, [userProfile]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    let newDisplayTab = [];
    let userbio;
    if (tab === "photos") {
      newDisplayTab = userProfile?.posts || [];
    } else if (tab === "posts") {
      newDisplayTab = userProfile?.posts || [];
    } else if (tab === "friends") {
      newDisplayTab = userProfile?.friends || [];
    } else if (tab === "about") {
      userbio = userProfile.bio || "";
      SetBio(userbio);
    } else if (tab === "saved") {
      newDisplayTab = userProfile?.saved || [];
    }
    setDisplayTab(newDisplayTab);
  };

  const friendReqHandler = async () => {
    try {
      const res = await axios.get(
        `${BACKEND_URL}/api/v1/user/friendorunfriend/${userId}`,
        { withCredentials: true }
      );

      if (res.data.success) {
        dispatch(setAuthUser(res.data.user));
        dispatch(setUserProfile(res.data.targetUser));

        // setIsFriend(res.data.user.friends.includes(userId));
        isFriend = !isFriend;
        toast.success(res.data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message);
      console.log(error);
    }
  };

  if (!userProfile && !user) {
    return <p>Loading...</p>;
  }
  const deletePostHandler = async () => {
    try {
      const res = await axios.delete(
        `${BACKEND_URL}/api/v1/post/delete/${selectedPost._id}`,
        { withCredentials: true }
      );
      if (res.data.success) {
        const updatedPostData = user.posts.filter(
          (postItem) => postItem?._id !== selectedPost?.id
        );
        dispatch(setPosts(updatedPostData));
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.messsage);
    }
  };

  if (!userProfile || Object.keys(userProfile).length === 0) {
    return <div>Failed to load user profile.</div>;
  }

  const savedHandler = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/v1/post/${selectedPost._id}/save`, {
        withCredentials: true
      })
      if (res.data.success) {
        toast.success(res.data.message);
        dispatch(setChangeSaved(res.data.savedPost))
      }
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className="flex flex-col items-center w-full h-screen flex-grow relative ">
      {/* Cover Photo */}
      <div className="relative w-full h-[60%] ">
        {userProfile && userProfile.coverPhoto ? (
          <img
            src={userProfile?.coverPhoto}
            alt="cover"
            className="w-[70%] h-[100%] object-center ml-[15%] rounded-lg"
          />
        ) : (
          <img
            src={blankcover}
            alt="cover"
            className="w-[70%] h-[100%] object-center ml-[15%] rounded-lg"
          />
        )}
        {isLoggedInUserProfile && (
          <button className="absolute bottom-8 right-[17%] bg-white p-2 rounded-full shadow-md">
            <Camera size={20} />
          </button>
        )}
      </div>

      {/* Profile Section */}
      <div className="flex justify-between  bg-white p-6 shadow-md -mt-16 rounded-lg w-[70%]  mx-[10%]">
        <div className="flex justify-start">
          <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
            {userProfile && userProfile.profilePicture ? (
              <AvatarImage src={userProfile?.profilePicture} alt="profile" />
            ) : (
              <AvatarImage src={blankprofilepic} alt="profile" />
            )}
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div className="flex flex-col ">
            <h2 className="text-2xl font-bold mt-14 ml-12">
              {userProfile?.username}
            </h2>
            <p className="text-gray-500 mt-4 ml-12">
              {userProfile?.friends?.length || 0} friends
            </p>
          </div>
        </div>
        <div className="mt-14 ml-6 flex gap-2">
          {isLoggedInUserProfile ? (
            <Button onClick={() => setOpen(!open)} variant="secondary">
              Edit Profile
            </Button>
          ) : (
            <Button
              onClick={friendReqHandler}
              className={
                isFriend ? "bg-gray-500 text-white" : "bg-blue-500 text-white"
              }
            >
              {isFriend ? "Remove Friend" : "Send Friend"}
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="w-full max-w-5xl mt-6 ">
        <div className="flex justify-center gap-10 border-b py-3 text-gray-600">
          {["posts", "about", "friends", "photos", "videos", "saved"].map(
            (tab) => (
              <span
                key={tab}
                className={`cursor-pointer ${activeTab === tab ? "font-bold border-b-2 border-black" : ""
                  }`}
                onClick={() => handleTabChange(tab)}
              >
                {tab.toUpperCase()}
              </span>
            )
          )}
        </div>
      </div>

      <div className="flex p-2 bg- w-2/3 gap-4 ">
        {/* Sidebar */}
        <div className="flex flex-col w-[22%] border rounded-md  min-h-[200px] max-h-[400px]  p-2">
          <h2 className="font-semibold text-xl ">Intro</h2>
          <div className="flex flex-col items-center gap-2">
            <h3 className="mt-2">{userProfile?.username}</h3>
            {user?._id === userProfile._id && (
              <Button
                className="w-full"
                onClick={() => setOpen(!open)}
                variant="secondary"
              >
                Edit Profile
              </Button>
            )}
          </div>
          {userProfile && userProfile.gender && (
            <p className="mt-4"> Gender : {userProfile?.gender}</p>
          )}

          {userProfile?.bio && (
            <div className="mt-2">
              <span className="font-medium">Bio:</span>{" "}
              <p className="text-gray-700">{userProfile?.bio}</p>
            </div>
          )}
        </div>

        {/* Dynamic Content Section */}
        <div className="flex-1 bg-white">
          {activeTab === "photos" && (
            <div className="grid grid-cols-3 gap-4">
              {displayTab
                .filter((post) => post.image)
                .map((post) => (
                  <div key={post._id} className="relative group cursor-pointer">
                    <img
                      src={post.image}
                      alt="post"
                      className="rounded-md w-full object-cover"
                    />
                  </div>
                ))}
            </div>
          )}

          {activeTab === "posts" && displayTab.length > 0 && (
            <div className="flex flex-col w-full mt-2">
              <div className="flex items-center justify-center">
                {user?._id === userProfile?._id && <CreatePost />}
              </div>
              <div className="-mb-10">
                {posts.length > 0 ? (
                  posts.map((post) => <Post key={post._id} post={post} />)
                ) : (
                  <p>No posts available</p>
                )}
              </div>

            </div>
          )}

          {activeTab === "saved" && (
            <div className="flex flex-col">
              {displayTab.map((post) => (
                <div
                  key={post._id}
                  className="flex justify-between cursor-pointer relative border rounded-md bg-slate-50 mb-2 "
                >
                  <div className="flex items-center">
                    <img
                      src={post.image}
                      alt="post"
                      className="rounded-lg w-2/6 mt-5 ml-5 mb-4 object-cover"
                    />
                    <span className="ml-10">{post.caption}</span>
                  </div>
                  <MoreHorizontal
                    onClick={() => {
                      setThreeDot(!threeDot);
                      dispatch(setSelectedPost(post));
                    }}
                    className="cursor-pointer mr-4  mt-8 "
                  />
                  {threeDot && (
                    <div
                      className="absolute flex flex-col right-2 items-center ml-4
                                          top-14 bg-white shadow-md  w-2/3  border rounded-md z-20 gap-2 my-2 cursor-pointer"
                    >
                      <h2 className="mt-2">Post Options</h2>
                      {post.author._id === user?._id && (
                        <h2
                          onClick={deletePostHandler}
                          className="flex items-center mr-1"
                        >
                          <RiDeleteBin6Line className="mr-1" />
                          Delete Post
                        </h2>
                      )}

                      <h2
                        className="mb-2 flex items-center "
                        onClick={() => {
                          navigate(`/profile/${post.author._id}`);
                          setThreeDot(!threeDot);
                          setActiveTab("posts");
                        }}
                      >
                        <Avatar className="mr-2 h-4 w-4">
                          <AvatarImage src={post.author.profilePicture} />
                          <AvatarFallback>C</AvatarFallback>
                        </Avatar>{" "}
                        View Profile
                      </h2>

                      {
                        user._id === userProfile._id &&
                        <h2 className="mb-2 flex items-center" onClick={savedHandler}>
                          <IoBookmarkOutline className="mr-1" />
                          Remove from saved
                        </h2>
                      }

                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === "about" && (
            <div className="flex flex-col w-full border rounded-md  bg-gray-100 p-2">
              <h2 className="font-semibold text-xl ">Intro</h2>
              <div className="flex flex-col items-center gap-2">
                <h3 className="mt-2">{userProfile.username}</h3>
                <button
                  type="button"
                  className="px-6 w-full bg-gray-200 border rounded-md"
                >
                  Edit Profile
                </button>
              </div>
              {userProfile.gender && <p> Gender : {userProfile.gender}</p>}

              {user?.bio && (
                <div className="mt-2">
                  <span className="font-medium">Bio:</span>{" "}
                  <p className="text-gray-700">{userProfile.bio}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "friends" && (
            <div className="flex flex-col my-2 ">
              {displayTab.map((friend) => (
                <div
                  className="hover:bg-gray-100 cursor-pointer  flex items-center justify-between gap-4 p-4"
                  key={friend._id}
                  onClick={() => navigate(`/profile/${friend._id}`)}
                >
                  <div className="ml-10">
                    <Avatar className="w-16 h-16 ">
                      <AvatarImage
                        className="w-full h-full object-cover"
                        src={friend?.profilePicture}
                        alt={friend?.username}
                      />
                      <AvatarFallback>
                        {friend.username.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <span className="font-medium mr-6">
                    {friend?.bio?.length > 50
                      ? friend.bio.slice(0, 50) + "..."
                      : friend?.bio}
                  </span>
                  <span className="font-medium mr-16">{friend?.username}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <EditProfile open={open} setOpen={setOpen} userProfile={userProfile} />
    </div>
  );
};

export default Profile;