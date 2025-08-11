"use client";
import axios from "axios";
import { BookMarked } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useState, useEffect } from "react";
import { ClipLoader } from "react-spinners";
import { toast } from "react-toastify";

const Img = () => {
  const [img, setImg] = useState({});
  const [moreImgs, setMoreImgs] = useState([]);
  const [isSaved, setIsSaved] = useState(false);

  const { id } = useParams();
  const { data: session } = useSession();

  const fetchImg = async () => {
    try {
      const response = await axios.get(`/api/images/${id}`, {
        headers: { "x-user-id": session?.user?.id },
      });
      setImg(response.data.img);
      const imgSaved =
        response.data.img.saves?.some(
          (element) => session?.user?.name === element
        ) ?? false;
      setIsSaved(imgSaved);
    } catch (error) {
      console.error("Error fetching image:", error);
    }
  };

  const fetchMoreImgs = async () => {
    try {
      const url = `/api/recommendations?imageId=${id}`;
      const res = await axios.get(url);
      if (res.data.success) {
        setMoreImgs(res.data.recommendations);
      } else {
        setMoreImgs([]);
      }
    } catch (error) {
      console.error("Error fetching more images:", error);
      setMoreImgs([]);
    }
  };

  const handlePinSave = async () => {
    try {
      const response = await axios.post(`/api/saves/${id}`);
      if (response.status === 201 || response.status === 200) {
        toast.success(response.data.message);
        fetchImg();
      } else {
        toast.error("Internal Server Error");
      }
    } catch (error) {
      toast.error("Failed to save image");
    }
  };

  const getCreatorName = (url) => {
    if (!url) return "";
    const parts = url.split("/");
    return parts[parts.length - 2] || "";
  };

  useEffect(() => {
    fetchImg();
    fetchMoreImgs();
  }, [id, session?.user?.id]);

  return (
    <>
      {img && img?.imgUrl ? (
        <div className="min-h-screen py-6">
          <div className="container mx-auto px-4">
            <div className="lg:flex lg:space-x-10 justify-center">
              <div className="w-full lg:w-auto mb-6 lg:mb-0">
                <Image
                  src={img?.imgUrl}
                  alt="Image"
                  priority={true}
                  className="rounded-2xl shadow-xl max-h-[600px] object-cover w-full lg:w-auto"
                  width={600}
                  height={600}
                />
              </div>

              <div className="lg:w-1/3 bg-white p-6 rounded-2xl shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <BookMarked
                      className={`${
                        isSaved
                          ? "fill-red-400 text-black hover:fill-red-600 cursor-pointer"
                          : "bg-transparent cursor-pointer hover:fill-red-200 hover:shadow-lg hover:scale-110"
                      } transition-all duration-300 w-10 h-10 p-2 rounded-full`}
                      onClick={handlePinSave}
                    />
                    <p className="text-gray-700 text-sm">
                      {img?.saves?.length <= 1
                        ? `${img?.saves?.length} Save`
                        : `${img?.saves?.length} Saves`}
                    </p>
                  </div>

                  <Link
                    href={img?.imgUrl}
                    target="_blank"
                    className="bg-purple-600 hover:bg-purple-700 transition text-white px-4 py-2 rounded-lg font-semibold"
                  >
                    Download
                  </Link>
                </div>

                {img?.creator_profile && (
                  <div className="mb-4">
                    <h4 className="text-lg font-semibold mb-2 text-gray-800">
                      Credits
                    </h4>
                    <p className="text-gray-700">
                      <span className="font-semibold">Creator's ID:</span>{" "}
                      {getCreatorName(img.creator_profile)}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-semibold">Profile:</span>{" "}
                      <Link
                        href={img.creator_profile}
                        target="_blank"
                        className="text-blue-600 underline hover:text-blue-800"
                      >
                        {img.creator_profile}
                      </Link>
                    </p>
                  </div>
                )}

                {img?.description && img.description.trim() !== "" && (
                  <div className="mb-4">
                    <h4 className="text-lg font-semibold mb-2 text-gray-800">
                      Description
                    </h4>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {img.description}
                    </p>
                  </div>
                )}

                {img?.mood && img.mood.length > 0 && (
                  <div className="mb-2">
                    <h4 className="text-lg font-semibold mb-2 text-gray-800">
                      Tags
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {img.mood.map((mood, index) => (
                        <span
                          key={index}
                          className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs shadow"
                        >
                          #{mood}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <h3 className="mt-10 text-2xl font-bold text-gray-900">More to explore</h3>
            <div className="flex space-x-4 overflow-x-auto py-4">
              {moreImgs.map((element) => (
                <Link href={`/img/${element._id}`} key={element._id.toString()}>
                  <Image
                    width={100}
                    height={100}
                    src={element?.imgUrl}
                    alt="Pin"
                    priority={true}
                    className="w-32 h-32 object-cover rounded-lg shadow-md hover:scale-105 transition-transform"
                  />
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex justify-center items-center min-h-[750px]">
          <ClipLoader color="#a855f7" size={120} />
        </div>
      )}
    </>
  );
};

export default Img;
