import React, { useState, useEffect } from "react";
import PostList from "../components/PostList";
import FilterBar from "../components/FilterBar";
import Footer from "../components/Footer";
import Pagination from "../components/Pagination";
import { useFilterPosts } from "../hooks/useFilterPosts";
const user = {
  "DeviceID": "device_001",
  "Username": "string",
  "FullName": "string",
  "Email": "user@example.com",
  "AvatarURL": "string",
  "UserID": 1,
  "FailedLoginAttempts": 0,
  "IsEmailConfirmed": false,
  "CreatedAt": "2025-11-30T10:17:19",
  "LastActive": null,
  "Status": "string"
};

export default function Home() {
  const [currentPage, setCurrentPage] = useState(1);

  const {
    startDate,
    endDate,
    selectedTopic,
    totalPages,
    posts,
    isLoading,
    error,
    setStartDate,
    setEndDate,
    setSelectedTopic,
    handleSearch,
  } = useFilterPosts({});

  return (
    <>
      <FilterBar
        startDate={startDate}
        endDate={endDate}
        selectedTopic={selectedTopic}
        isLoadingData={isLoading}
        error={error}
        onChangeStart={setStartDate}
        onChangeEnd={setEndDate}
        onChangeTopic={setSelectedTopic}
        onSearch={handleSearch}
      />

      <div className="bg-gray-100 dark:bg-gray-900 py-6">
        <div className="container mx-auto space-y-6">
          <PostList posts={posts} user={user} />

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      </div>
      <Footer />
    </>

  );
}
