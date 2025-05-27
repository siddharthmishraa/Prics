"use client";
import Masonry from 'react-masonry-css';
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { ClipLoader } from "react-spinners";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function Home() {
  const [images, setImages] = useState([]);
  const searchParams = useSearchParams();
  const search = searchParams.get("search");

  const getImages = async () => {
    try {
      const url = search
        ? `http://localhost:3000/api/images?search=${search}`
        : "http://localhost:3000/api/images";

      const response = await axios.get(url);
      setImages(response.data.images);
    } catch (error) {
      console.error("Error fetching images:", error);
      setImages([]);
    }
  };

  useEffect(() => {
    getImages();
  }, [search]);

  const breakpointColumnsObj = {
    default: 5,
    1200: 4,
    992: 3,
    768: 2,
    500: 1,
  };

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
            <Link
              href={`/img/${item._id}`}
              key={item._id}
              className="relative group"
            >
              <Image
                src={item?.imgUrl}
                alt={item?.description || "image"}
                height={300}
                width={300}
                className="w-full h-auto rounded-lg mb-4"
              />
              <span className="absolute inset-0 flex bg-black bg-opacity-50 opacity-0 group-hover:opacity-50 transition-opacity duration-300 hover:rounded" />
            </Link>
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
