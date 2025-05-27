"use client";

import { Menu, Search } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState, useRef, useEffect } from "react";

const Navbar = () => {
  // Get session data (e.g., user info) from NextAuth
  const { data: session } = useSession();
  const router = useRouter();

  // Local state
  const [query, setQuery] = useState(""); // Search query
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Mobile menu toggle
  const [isDropdownOpen, setDropdownOpen] = useState(false); // Dropdown visibility for logout

  // Ref for detecting clicks outside the dropdown
  const dropdownRef = useRef(null);

  // Toggle dropdown open/close
  const toggleDropdown = () => setDropdownOpen((prev) => !prev);

  // Handle search functionality
  const handleSearch = () => {
    if (query.trim()) {
      router.push(`/?search=${query}`);
      setQuery("");
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="w-full shadow-md px-4 md:px-8 py-3 relative">
      <div className="items-center container flex justify-between mx-auto gap-5">
        {/* Logo - clickable and navigates to home */}
        <div className="flex items-center space-x-4">
          <Link href="/">
            <Image
              src="/prics.svg"
              width={50}
              height={50}
              alt="Logo"
              className="w-9 h-9 cursor-pointer hover:scale-105 transition-transform duration-200"
              priority
            />
          </Link>
        </div>

        {/* Search Bar (Desktop only) */}
        <div className="hidden sm:block w-1/2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              className="w-full py-2 px-4 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 pr-12"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Search
              onClick={handleSearch}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 rounded-full bg-purple-500 text-white w-8 h-8 p-1 transition-all duration-300 hover:bg-purple-700 cursor-pointer"
            />
          </div>
        </div>

        {/* Right Section: Greeting Dropdown + Mobile Menu Icon */}
        <div className="flex items-center gap-4">
          {/* Greeting Dropdown with Logout */}
          {session?.user?.name && (
            <div className="relative" ref={dropdownRef}>
              <div
                className="flex items-center space-x-1 cursor-pointer"
                onClick={toggleDropdown}
                role="button"
                aria-haspopup="true"
                aria-expanded={isDropdownOpen}
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && toggleDropdown()}
              >
                <span className="text-gray-800 font-medium">
                  Hello, {session.user.name}
                </span>
                <svg
                  className="w-4 h-4 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>

              {/* Dropdown Menu for Logout */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg border rounded-lg z-10">
                  <button
                    className="block px-4 py-2 text-purple-500 w-full text-start hover:bg-gray-100"
                    onClick={() => {
                      setDropdownOpen(false);
                      signOut({ callbackUrl: "/signin" });
                    }}
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Hamburger Icon for Mobile Menu */}
          <Menu
            className="text-purple-500 cursor-pointer block sm:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            size={40}
          />
        </div>
      </div>

      {/* Mobile Menu Links */}
      <div
        className={`${
          isMenuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
        } overflow-hidden transition-all duration-300 ease-in-out sm:hidden mt-4`}
      >
        <div className="flex flex-col space-y-2 px-4 items-center">
          <Link
            href="/"
            className="block py-2 text-black text-xl transition-all duration-300 hover:text-purple-500"
          >
            Home
          </Link>
          <Link
            href="/upload_image"
            className="block text-black text-xl transition-all duration-300 hover:text-purple-500"
          >
            Upload Image
          </Link>

          {/* Mobile Search Input */}
          <div className="relative w-full mt-2 py-2">
            <input
              type="text"
              placeholder="Search"
              className="w-full py-2 px-4 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 pr-12"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Search
              onClick={handleSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 rounded-full bg-purple-500 text-white w-8 h-8 p-1 transition-all duration-300 hover:bg-purple-700 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
