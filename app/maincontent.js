"use client";
import Masonry from "react-masonry-css";
import axios from "axios";
import Image from "next/image";
import { ClipLoader } from "react-spinners";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function MainContent() {
  const [images, setImages] = useState([]);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const search = searchParams.get("search");

  useEffect(() => {
    if (status === "loading") return;
    const getImages = async () => {
      try {
        let response;
        if (search) {
          response = await axios.get(`/api/images?search=${encodeURIComponent(search)}`);
          setImages(response.data.images || []);
        } else {
          // Homepage recommendations mode
          response = await axios.get("/api/recommendations");
          if (response.data.success) {
            setImages(response.data.recommendations || []);
          }
        }
      } catch (error) {
        console.error("Error fetching images:", error);
        setImages([]);
      }
    };
    getImages();
  }, [search, status]);

  const breakpointColumnsObj = {
    default: 5,
    1200: 4,
    992: 3,
    768: 2,
    500: 1,
  };

  const handleImageClick = (id) => {
    if (status === "loading") return;
    if (status === "authenticated") {
      router.push(`/img/${id}`);
    } else {
      router.push(`/signin?callbackUrl=/img/${id}`);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <ClipLoader color="#ef4444" size={60} />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {(!images || images.length === 0) && !search ? (
        <div className="flex justify-center items-center min-h-[750px]">
          <ClipLoader color="#ef4444" size={120} />
        </div>
      ) : images.length > 0 ? (
        <Masonry
          breakpointCols={breakpointColumnsObj}
          className="my-masonry-grid"
          columnClassName="my-masonry-grid_column"
        >
          {images.map((item) => (
            <div
              key={item._id.toString()}
              className="relative group cursor-pointer"
              onClick={() => handleImageClick(item._id)}
            >
              <Image
                src={item?.imgUrl}
                alt={item?.description || "image"}
                height={300}
                width={300}
                className="w-full h-auto rounded-lg mb-4"
              />
              <span className="absolute inset-0 flex bg-black bg-opacity-50 opacity-0 group-hover:opacity-50 transition-opacity duration-300 hover:rounded" />
            </div>
          ))}
        </Masonry>
      ) : (
        <h3 className="min-h-[750px] flex justify-center items-center text-purple-500 text-4xl font-semibold">
          No results found for your search.
        </h3>
      )}
    </div>
  );
}
