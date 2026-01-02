//import { Code, Database, Brain, Palette, Users, Zap,PenTool,FileText,Settings, Heart, Sparkles, Github, Linkedin, Mail } from "lucide-react";
import {
  Code, Database, Brain, Palette, Users, Zap,
  PenTool, FileText, Settings,
  Heart, Sparkles, Github, Linkedin, Mail
} from "lucide-react";
import { Presentation } from "lucide-react";

export default function About() {
  // const teamMembers = [
  //   {
  //     name: "Phạm Thị Ngọc Oanh",
  //     role: "Trưởng nhóm, Nhà khoa học dữ liệu, Lập trình viên",
  //     avatar: "Screenshot 2025-12-07 224628.png",
  //     color: "from-pink-500 to-rose-500",
  //     bgColor: "from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20",
  //     responsibilities: [
  //       { icon: <Brain className="w-4 h-4" />, text: "Nghiên cứu mô hình NLP và phân tích cảm xúc" },
  //       { icon: <Database className="w-4 h-4" />, text: "Thực hiện tiền xử lý dữ liệu" },
  //       { icon: <Zap className="w-4 h-4" />, text: "Đánh giá và tối ưu hóa mô hình" },
  //       { icon: <Code className="w-4 h-4" />, text: "Xây dựng backend và API với Python" },
  //       { icon: <Sparkles className="w-4 h-4" />, text: "Tích hợp API phân tích cảm xúc vào website" },
  //       { icon: <Zap className="w-4 h-4" />, text: "Kiểm thử chức năng AI" },
  //       { icon: <Users className="w-4 h-4" />, text: "Lên kế hoạch, điều phối và phân công công việc nhóm" }
  //     ],
  //     socialLinks: {
  //       github: "https://github.com/oripham",
  //       linkedin: "https://www.linkedin.com/in/oripham",
  //       email: "mailto:6351071055@utc2.st.edu.vn"
  //     }
  //   },
  //   {
  //     name: "Đỗ Văn Thành Được",
  //     role: "Phân tích viên, Thiết kế viên, Quản trị CSDL, Kiểm thử viên",
  //     avatar: "avatar-shin-cute-2.jpeg",
  //     color: "from-blue-500 to-cyan-500",
  //     bgColor: "from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20",
  //     responsibilities: [
  //       { icon: <Code className="w-4 h-4" />, text: "Phát triển frontend bằng React.js" },
  //       { icon: <Database className="w-4 h-4" />, text: "Phối hợp tiền xử lý dữ liệu" },
  //       { icon: <Brain className="w-4 h-4" />, text: "Phân tích yêu cầu hệ thống" },
  //       { icon: <Palette className="w-4 h-4" />, text: "Thiết kế UI/UX, dashboard hiển thị kết quả" },
  //       { icon: <Database className="w-4 h-4" />, text: "Thiết kế & quản lý cơ sở dữ liệu" },
  //       { icon: <Zap className="w-4 h-4" />, text: "Kiểm thử hệ thống (chức năng, hiệu suất, bảo mật)" },
  //       { icon: <Sparkles className="w-4 h-4" />, text: "Viết tài liệu hướng dẫn sử dụng" }
  //     ],
  //     socialLinks: {
  //       github: "https://github.com/TeeNoiz04",
  //       linkedin: "https://www.linkedin.com/in/noiz-tee-b79557356/",
  //       email: "mailto:duoc14525@gmail.com"
  //     }
  //   }
  // ];

   const teamMembers = [
    {
      name: "Phạm Thị Ngọc Oanh",
      role: "AI/ML Engineer & Backend Developer",
      avatar: "Screenshot 2025-12-07 224628.png", // Thay đổi tên file avatar
      color: "from-purple-500 to-pink-500",
      bgColor: "from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20",
      responsibilities: [
        { 
          icon: <PenTool className="w-4 h-4" />, 
          text: "Tham gia gán nhãn dữ liệu" 
        },
        { 
          icon: <FileText className="w-4 h-4" />, 
          text: "Tìm hiểu và triển khai các phương pháp tóm tắt văn bản" 
        },
        { 
          icon: <Brain className="w-4 h-4" />, 
          text: "Đề xuất và xây dựng kiến trúc mô hình học đa nhiệm (multitask) dựa trên PhoBERT" 
        },
        { 
          icon: <Code className="w-4 h-4" />, 
          text: "Hỗ trợ xây dựng backend cho hệ thống website phân tích" 
        }
      ],
      socialLinks: {
        github: "https://github.com/oanh",
        linkedin: "https://linkedin.com/in/oanh",
        email: "oanh@example.com"
      }
    },
    {
      name: "Đỗ Văn Thành Được",
      role: "Full-stack Developer & Data Collector",
      avatar: "avatar-shin-cute-2.jpeg", // Thay đổi tên file avatar
      color: "from-blue-500 to-cyan-500",
      bgColor: "from-blue-100 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20",
      responsibilities: [
        { 
          icon: <Database className="w-4 h-4" />, 
          text: "Thu thập dữ liệu" 
        },
        { 
          icon: <Code className="w-4 h-4" />, 
          text: "Xây dựng giao diện và luồng xử lý cho hệ thống website phân tích" 
        },
        { 
          icon: <PenTool className="w-4 h-4" />, 
          text: "Tham gia gán nhãn dữ liệu" 
        }
      ],
      socialLinks: {
        github: "https://github.com/duoc",
        linkedin: "https://linkedin.com/in/duoc",
        email: "duoc@example.com"
      }
    },
    {
      name: "Trần Phương Anh",
      role: "Data Engineer & Documentation Specialist",
      avatar: "anh.jpg", // Thay đổi tên file avatar
      color: "from-green-500 to-emerald-500",
      bgColor: "from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20",
      responsibilities: [
        { 
          icon: <Database className="w-4 h-4" />, 
          text: "Thu thập dữ liệu" 
        },
        { 
          icon: <Settings className="w-4 h-4" />, 
          text: "Tìm hiểu về quá trình tiền xử lý dữ liệu và triển khai" 
        },
        { 
          icon: <PenTool className="w-4 h-4" />, 
          text: "Tham gia gán nhãn dữ liệu" 
        },
        { 
          icon: <FileText className="w-4 h-4" />, 
          text: "Viết báo cáo" 
        }
      ],
      socialLinks: {
        github: "https://github.com/anh",
        linkedin: "https://linkedin.com/in/anh",
        email: "anh@example.com"
      }
    },
    {
      name: "Lê Đình Khôi",
      role: "ML Researcher & Presentation Designer",
      avatar: "khoi.jpg", // Thay đổi tên file avatar
      color: "from-orange-500 to-red-500",
      bgColor: "from-orange-100 to-red-100 dark:from-orange-900/20 dark:to-red-900/20",
      responsibilities: [
        { 
          icon: <Database className="w-4 h-4" />, 
          text: "Thu thập dữ liệu" 
        },
        { 
          icon: <Brain className="w-4 h-4" />, 
          text: "Tìm hiểu các phương pháp phân tích cảm xúc và triển khai" 
        },
        { 
          icon: <PenTool className="w-4 h-4" />, 
          text: "Tham gia gán nhãn dữ liệu" 
        },
        { 
          icon: <Presentation className="w-4 h-4" />, 
          text: "Thiết kế slide" 
        }
      ],
      socialLinks: {
        github: "https://github.com/khoi",
        linkedin: "https://linkedin.com/in/khoi",
        email: "khoi@example.com"
      }
    }
  ];
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/10 dark:to-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 dark:from-blue-600/5 dark:to-purple-600/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-16 sm:py-24">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full shadow-lg border border-purple-200 dark:border-purple-800 cursor-pointer hover:scale-105 transition-transform duration-300">
              <Heart className="w-5 h-5 text-pink-500 animate-pulse" />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Meet The Team
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                Đội Ngũ Sáng Tạo
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Chúng mình là hai sinh viên đam mê công nghệ, kết hợp sức mạnh của AI và thiết kế
              để xây dựng một cộng đồng trực tuyến hiện đại, thông minh và thân thiện! 🎉
            </p>

            <div className="flex items-center justify-center gap-4 pt-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 rounded-full cursor-pointer hover:scale-105 transition-transform duration-300">
                <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">AI-Powered</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500/10 to-rose-500/10 dark:from-pink-500/20 dark:to-rose-500/20 rounded-full cursor-pointer hover:scale-105 transition-transform duration-300">
                <Heart className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Community First</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Members */}
   <div className="max-w-7xl mx-auto px-4 py-12 sm:py-16">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {teamMembers.map((member, index) => (
            <div
              key={index}
              className="group relative bg-white dark:bg-gray-800 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 dark:border-gray-700 hover:-translate-y-2"
            >
              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${member.bgColor} opacity-50`}></div>

              {/* Content */}
              <div className="relative p-8 sm:p-10">
                {/* Avatar & Header */}
                <div className="flex items-start gap-6 mb-6">
                  <div className={`flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br ${member.color} rounded-2xl shadow-lg flex items-center justify-center text-4xl sm:text-5xl transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500`}>
                    <img 
                      src={`../img/${member.avatar}`} 
                      alt={member.name}
                      className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-2xl" 
                      onError={(e) => {
                        // Fallback to initials if image fails to load
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = member.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                      }}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2 break-words">
                      {member.name}
                    </h3>
                    <p className={`text-sm sm:text-base font-semibold bg-gradient-to-r ${member.color} bg-clip-text text-transparent leading-relaxed`}>
                      {member.role}
                    </p>
                  </div>
                </div>

                {/* Divider */}
                <div className={`h-1 w-20 bg-gradient-to-r ${member.color} rounded-full mb-6`}></div>

                {/* Responsibilities */}
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
                    Vai trò & Nhiệm vụ
                  </h4>
                  {member.responsibilities.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 group/item hover:translate-x-2 transition-transform duration-300"
                    >
                      <div className={`flex-shrink-0 w-8 h-8 bg-gradient-to-br ${member.color} rounded-lg flex items-center justify-center text-white shadow-md`}>
                        {item.icon}
                      </div>
                      <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed pt-1">
                        {item.text}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Social Links */}
                <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  {/* Github */}
                  <a
                    href={member.socialLinks.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-2 bg-gradient-to-r ${member.color} text-white rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-110`}
                    aria-label="Github"
                  >
                    <Github className="w-5 h-5" />
                  </a>

                  {/* Linkedin */}
                  <a
                    href={member.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-2 bg-gradient-to-r ${member.color} text-white rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-110`}
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="w-5 h-5" />
                  </a>

                  {/* Email */}
                  <a
                    href={`mailto:${member.socialLinks.email}`}
                    className={`p-2 bg-gradient-to-r ${member.color} text-white rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-110`}
                    aria-label="Email"
                  >
                    <Mail className="w-5 h-5" />
                  </a>
                </div>
              </div>

              {/* Bottom Accent */}
              <div className={`h-2 bg-gradient-to-r ${member.color}`}></div>
            </div>
          ))}
        </div>
      </div>

      {/* Mission Statement */}
      <div className="max-w-5xl mx-auto px-4 py-12 sm:py-16">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl shadow-2xl p-8 sm:p-12 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48cGF0aCBkPSJNLTEwIDMwaDYwIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMSIgb3BhY2l0eT0iMC4xIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2EpIi8+PC9zdmc+')] opacity-30"></div>

          <div className="relative z-10">
            <Sparkles className="w-12 h-12 mx-auto mb-4 animate-pulse" />
            <h2 className="text-3xl sm:text-4xl font-black mb-4">
              Sứ Mệnh Của Chúng Mình
            </h2>
            <p className="text-lg sm:text-xl leading-relaxed max-w-3xl mx-auto opacity-95">
              Xây dựng một nền tảng cộng đồng thông minh, nơi công nghệ AI giúp hiểu và kết nối
              con người một cách chân thực hơn. Chúng mình tin rằng mỗi ý kiến đều có giá trị,
              và với sự trợ giúp của AI, chúng ta có thể tạo ra một môi trường giao tiếp tích cực,
              an toàn và đầy cảm hứng! ✨
            </p>
          </div>
        </div>
      </div>

      {/* Fun Facts Section */}
      <div className="max-w-5xl mx-auto px-4 py-8 pb-16">
        <div className="grid sm:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700">
            <div className="text-4xl mb-2">🎯</div>
            <div className="text-3xl font-black text-gray-900 dark:text-white mb-1">100%</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Đam mê công nghệ</div>
          </div>
          <div className="text-center p-6 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700">
            <div className="text-4xl mb-2">⚡</div>
            <div className="text-3xl font-black text-gray-900 dark:text-white mb-1">24/7</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Sẵn sàng code</div>
          </div>
          <div className="text-center p-6 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700">
            <div className="text-4xl mb-2">🚀</div>
            <div className="text-3xl font-black text-gray-900 dark:text-white mb-1">∞</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Ý tưởng sáng tạo</div>
          </div>
        </div>
      </div>
    </div>
  );
}