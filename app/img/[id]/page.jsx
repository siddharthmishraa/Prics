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

  const fetchMoreImgs = async () => {
    const response = await axios.get("http://localhost:3000/api/images/");
    // Filter out the current image by ID
    const filtered = response.data.images.filter(
      (image) => image._id !== id
    );
    setMoreImgs(filtered);
  };

  const fetchImg = async () => {
    const response = await axios.get(
      `http://localhost:3000/api/images/${id}`
    );
    setImg(response.data.img);
    const imgSaved =
      response.data.img.saves?.some(
        (element) => session?.user?.name === element
      ) ?? false;
    setIsSaved(imgSaved);
  };

  const handlePinSave = async () => {
    try {
      const response = await axios.post(
        `http://localhost:3000/api/saves/${id}`
      );
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

  useEffect(() => {
    fetchImg();
    fetchMoreImgs();
  }, [id]);

  return (
    <>
      {img && img?.imgUrl && moreImgs ? (
        <div className="min-h-screen py-3 md:py-6">
          <div className="container mx-auto px-4">
            <div className="lg:flex justify-center">
              <div className="w-fit mb-6 lg:mb-0 mx-auto lg:mx-0">
                <Image
                  src={img?.imgUrl}
                  alt="Image"
                  priority={true}
                  className="rounded-xl shadow-lg max-h-[600px] object-cover w-auto md:ml-auto"
                  width={300}
                  height={300}
                />
              </div>
              <div className="lg:w-1/3 lg:pl-10">
                <div className="flex justify-between items-center mb-6">
                  <BookMarked
                    className={`
                      ${
                        isSaved
                          ? "fill-red-300 text-black hover:fill1-red-700 cursor-pointer"
                          : "bg-transparent cursor-pointer hover:fill-red-200 hover:shadow-lg hover:animate-pulse"
                      } 
                      transition-all duration-300 w-10 h-10 p-2 rounded-full
                    `}
                    onClick={handlePinSave}
                  />

                  <div>
                    <Link
                      href={img?.imgUrl}
                      target="_blank"
                      className="bg-purple-500 text-white px-4 py-3 rounded-lg font-semibold"
                    >
                      Download
                    </Link>
                  </div>
                </div>
                <p>
                  {img?.saves?.length <= 1
                    ? `${img?.saves?.length} Save`
                    : `${img?.saves?.length} Saves`}
                </p>
              </div>
            </div>
            <h3 className="mt-10 text-2xl font-semibold">More to explore</h3>
            <div className="flex space-x-4 overflow-x-auto py-4">
              {moreImgs &&
                moreImgs.map((element) => {
                  return (
                    <Link href={`${element._id}`} key={element._id}>
                      <Image
                        width={100}
                        height={100}
                        src={element?.imgUrl}
                        alt="Pin"
                        priority={true}
                        className="w-32 h-32 object-cover rounded-lg shadow-md"
                      ></Image>
                    </Link>
                  );
                })}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex justify-center items-center min-h-[750px]">
          <ClipLoader color="#d6b4fc" size={120}></ClipLoader>
        </div>
      )}
    </>
  );
};

export default Img;
