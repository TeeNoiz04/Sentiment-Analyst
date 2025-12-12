import PostList from "../components/PostList";
import FilterBar from "../components/FilterBar";
import Footer from "../components/Footer";
import Pagination from "../components/Pagination";
import { useFilterPosts } from "../hooks/useFilterPosts";


export default function Home() {
  const {
    startDate,
    endDate,
    selectedTopic,
    totalPages,
    currentPage,
    user,
    setCurrentPage,
    posts,
    isLoading,
    error,
    setStartDate,
    setEndDate,
    setSelectedTopic,
    handleSearch,
  } = useFilterPosts({});
  if(user) console.log("Home - current user:", user);
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
            onPageChange={(currentPage) => {
              setCurrentPage(currentPage);
            }}
          />
        </div>
      </div>
      <Footer />
    </>

  );
}
