import { Link } from "react-router-dom";

export default function Footer() {
    return (
        <footer className="py-6 px-16 border-t border-gray-200 font-light flex flex-col lg:flex-row justify-between items-center">
            <p className="text-gray-700 mb-6 lg:mb-0">
                Copyright &copy; {new Date().getFullYear()}{' '}
                <a
                    href="https://www.creative-tim.com?ref=mtdk"
                    target="_blank"
                    rel="noreferrer"
                    className="text-light-blue-500 hover:text-light-blue-700"
                >
                    Creative Hội Bàn Tròn
                </a>
            </p>

            <ul className="list-unstyled flex">

                <li className="mr-6">
                    <Link
                        to="/blog"
                        className="text-gray-700 hover:text-gray-900 font-medium block text-sm"
                    >
                        Tạo bài viết
                    </Link>
                </li>
                <li className="mr-6">
                    <Link
                        to="/about-us"
                        className="text-gray-700 hover:text-gray-900 font-medium block text-sm"
                    >
                        Về chúng tôi
                    </Link>
                </li>
                <li className="mr-6">
                    <Link
                        to="/license"
                        className="text-gray-700 hover:text-gray-900 font-medium block text-sm"
                    >
                        Hồ sơ
                    </Link>
                </li>

            </ul>

        </footer>
    );
}