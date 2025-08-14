"use client";
import axios from "axios";
import { BookMarked } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useState, useEffect, useRef } from "react";
import { ClipLoader } from "react-spinners";
import { toast } from "react-toastify";

const Img = () => {
  const [img, setImg] = useState({});
  const [moreImgs, setMoreImgs] = useState([]);
  const [isSaved, setIsSaved] = useState(false);

  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();

  const scrollRef = useRef(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  // Arrow visibility logic based on scroll position
  const handleScroll = () => {
    const container = scrollRef.current;
    if (!container) return;
    const { scrollLeft, scrollWidth, clientWidth } = container;
    setShowLeft(scrollLeft > 5); // slight threshold to avoid flicker
    setShowRight(scrollLeft + clientWidth < scrollWidth - 5);
  };

  // Scroll the carousel smoothly by fixed amount
  const scrollContainer = (direction) => {
    const container = scrollRef.current;
    if (!container) return;
    const scrollAmount = 300; // adjust to your preference
    if (direction === "left") {
      container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    } else {
      container.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const fetchImg = async () => {
    try {
      const response = await axios.get(`/api/images/${id}`, {
        headers: {
          "x-user-id": session?.user?.id,
        },
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
      const headers = {};
      if (session?.user?.id) {
        headers["x-user-id"] = session.user.id; // only send if user is logged in
      }
      const res = await axios.get(`/api/recommendations?imageId=${id}`, { headers });
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

  // Initialize arrow visibility when moreImgs changes or after ref set
  useEffect(() => {
    handleScroll();
  }, [moreImgs]);

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
                    <p className="text-gray-700 whitespace-pre-wrap">{img.description}</p>
                  </div>
                )}

                {img?.mood && img.mood.length > 0 && (
                  <div className="mb-2">
                    <h4 className="text-lg font-semibold mb-2 text-gray-800">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {img.mood.map((mood, index) => (
                        <Link
                          key={index}
                          href={`/?search=${encodeURIComponent(mood)}`}
                          className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs shadow hover:bg-purple-200 transition"
                        >
                          #{mood}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* More to explore carousel */}
            <h3 className="mt-10 text-2xl font-bold text-gray-900">More to explore</h3>
            <div className="relative">
              {/* Left Arrow (desktop only) */}
              {showLeft && (
                <button
                  onClick={() => scrollContainer("left")}
                  className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 bg-white shadow-lg rounded-full p-2 z-10 hover:bg-gray-100"
                  aria-label="Scroll Left"
                >
                  &#8592;
                </button>
              )}

              {/* Scrollable container */}
              <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex space-x-4 overflow-x-auto py-4 px-1 scroll-smooth snap-x snap-mandatory hide-scrollbar"
                style={{ scrollSnapType: 'x mandatory' }} // optional inline style for strict snap 
              >
                {moreImgs.map((element) => (
                  <Link
                    href={`/img/${element._id}`}
                    key={element._id.toString()}
                    className="flex-shrink-0 snap-start"
                  >
                    <Image
                      width={150}
                      height={150}
                      src={element?.imgUrl}
                      alt="Pin"
                      priority={true}
                      className="w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 object-cover rounded-lg shadow-md hover:scale-105 transition-transform"
                    />
                  </Link>
                ))}
              </div>

              {/* Right Arrow (desktop only) */}
              {showRight && (
                <button
                  onClick={() => scrollContainer("right")}
                  className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 bg-white shadow-lg rounded-full p-2 z-10 hover:bg-gray-100"
                  aria-label="Scroll Right"
                >
                  &#8594;
                </button>
              )}
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
