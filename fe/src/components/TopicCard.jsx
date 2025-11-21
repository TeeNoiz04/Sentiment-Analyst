const TopicCard = ({ title, percent, count, color }) => {
    return (
        <div 
            className="p-4 rounded-xl text-white shadow-lg flex flex-col justify-between transition duration-300 ease-in-out transform hover:scale-[1.03] min-w-[150px]"
            style={{ backgroundColor: color }}
        >
            <p className="text-sm font-medium mb-1 opacity-90">{title}</p>
            <div className="text-4xl font-extrabold my-2">
                {percent}%
            </div>
            <div className="text-xs font-light opacity-80">
                ({count} bài viết)
            </div>
        </div>
    );
};

export default TopicCard;