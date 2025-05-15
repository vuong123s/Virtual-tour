import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay, EffectFade } from 'swiper/modules';
import { useNavigate, Link } from 'react-router-dom';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import Logo1 from "../assets/logo1.png";
import { useAuth } from '../contexts/AuthContext';

const API_BASE_URL = 'http://localhost:8000/api';

const UserInterface = () => {
  const { user, logout } = useAuth();
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchTours();
  }, []);

  const fetchTours = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/tours`);
      if (!response.ok) throw new Error('Failed to fetch tours');
      const data = await response.json();
      const toursArray = Array.isArray(data) ? data : data.tours || [];
      setTours(toursArray);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tours:', error);
      setTours([]);
      setLoading(false);
    }
  };

  const handleTourClick = (tourId) => navigate(`/tour/${tourId}`);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const slides = Array.isArray(tours)
    ? tours.map(tour => ({
        id: tour.tourId,
        title: tour.name || 'Untitled Tour',
        subtitle: tour.description || 'No description available',
        image: tour.panoramas[0].imageUrl ||
          "https://images.unsplash.com/photo-1519501025264-65ba15a82390?ixlib=rb-4.0.3&auto=format&fit=crop&w=764&q=80"
      }))
    : [];

  const filteredTours = tours.filter(tour =>
    tour.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (tour.description && tour.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Navigation Bar */}
      <nav className="bg-white/80 backdrop-blur-md shadow-lg fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <img className="h-6 mx-2 my-3" src={Logo1} alt="Logo" />
              </Link>
            </div>
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-8">
                <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors duration-300">Home</a>
                <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors duration-300">About</a>
                <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors duration-300">Contact</a>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">Hi, {user?.username || 'User'}</span>
                <button onClick={handleLogout} className="text-red-400 hover:text-red-300 text-sm">
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Slice Section */}
      <div className="relative pt-16">
        <div className="max-w-7xl mx-auto mt-5 px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
            {/* Content Section */}
            <div className="relative z-10 mb-8 lg:mb-0">
              <div className="text-center lg:text-left">
                <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block">Discover Amazing</span>
                  <span className="block bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                    Virtual Tours
                  </span>
                </h2>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Experience stunning locations from around the world through our immersive virtual tours.
                </p>
                <div className="mt-8 sm:mt-10 sm:flex sm:justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
                  <div className="rounded-md shadow">
                    <a href="#" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 transition-all duration-300 transform hover:scale-105">
                      Get Started
                    </a>
                  </div>
                  <div>
                    <a href="#" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100 transition-all duration-300 transform hover:scale-105">
                      Learn More
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Slider Section */}
            <div className="relative h-[400px] sm:h-[500px] lg:h-[600px] rounded-2xl overflow-hidden shadow-2xl">
              {loading ? (
                <div className="h-full w-full flex items-center justify-center bg-gray-100">
                  <div className="text-2xl text-gray-600">Loading tours...</div>
                </div>
              ) : (
                <Swiper
                  modules={[Pagination, Autoplay, EffectFade]}
                  spaceBetween={0}
                  slidesPerView={1}
                  loop={true}
                  pagination={{ 
                    clickable: true,
                    dynamicBullets: true,
                  }}
                  effect="fade"
                  autoplay={{
                    delay: 5000,
                    disableOnInteraction: false,
                  }}
                  className="h-full w-full"
                >
                  {slides.map((slide) => (
                    <SwiperSlide key={slide.id}>
                      <div 
                        className="relative h-full w-full group cursor-pointer" 
                      >
                        <img
                          src={slide.image}
                          alt={slide.title}
                          className="h-full w-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                          <div className="absolute bottom-0 left-0 right-0 p-8">
                            <h3 className="text-white text-3xl font-bold mb-2 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500"
                             onClick={() => handleTourClick(slide.id)}
                            >
                              {slide.title}
                            </h3>
                            <p className="text-gray-200 text-lg transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-100">
                              {slide.subtitle}
                            </p>
                          </div>
                        </div>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              )}
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {/* Feature 1 */}
              <div className="p-8 bg-gradient-to-br from-blue-50 to-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">360° Views</h3>
                <p className="text-gray-600">
                  Immerse yourself in stunning panoramic views of every location
                </p>
              </div>
              {/* Feature 2 */}
              <div className="p-8 bg-gradient-to-br from-blue-50 to-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Interactive Elements</h3>
                <p className="text-gray-600">
                  Click and explore points of interest with detailed information
                </p>
              </div>
              {/* Feature 3 */}
              <div className="p-8 bg-gradient-to-br from-blue-50 to-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">HD Quality</h3>
                <p className="text-gray-600">
                  Experience crystal clear visuals in high definition
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      
        {/* Tour List Section */}
        <div className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                Explore Our Virtual Tours
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Discover amazing locations through our immersive virtual tours
              </p>
            </div>

            {/* Search Input */}
            <div className="max-w-xl mx-auto mb-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search tours..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-300"
                />
                <svg
                  className="absolute right-3 top-3.5 h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="text-xl text-gray-600">Loading tours...</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {filteredTours.map((tour) => (
                  <div
                    key={tour.tourId}
                    className="bg-white rounded-lg shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 cursor-pointer"
                    onClick={() => handleTourClick(tour.tourId)}
                  >
                    <div className="relative h-48">
                      <img
                        src={tour.panoramas[0]?.imageUrl || "https://images.unsplash.com/photo-1519501025264-65ba15a82390?ixlib=rb-4.0.3&auto=format&fit=crop&w=764&q=80"}
                        alt={tour.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {tour.name}
                      </h3>
                      <p className="text-gray-600 line-clamp-2">
                        {tour.description || 'No description available'}
                      </p>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                          {tour.panoramas.length} scenes
                        </span>
                        <button className="text-blue-600 hover:text-blue-800 font-medium">
                          View Tour →
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>


      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-blue-400">About Us</h3>
              <p className="text-gray-400">
                We provide immersive virtual tours to help you explore amazing locations worldwide.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-blue-400">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-blue-400 transition-colors duration-300">Home</a></li>
                <li><a href="#" className="text-gray-400 hover:text-blue-400 transition-colors duration-300">Tours</a></li>
                <li><a href="#" className="text-gray-400 hover:text-blue-400 transition-colors duration-300">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-blue-400">Contact</h3>
              <p className="text-gray-400">
                Email: info@virtualtour.com<br />
                Phone: (123) 456-7890
              </p>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-400">&copy; 2024 Virtual Tour. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default UserInterface;