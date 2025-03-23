import React from 'react';
import "./../App.css";

const TourList = () => {
  const cardsData = [
    {
      imgSrc: "https://i.pinimg.com/474x/00/cc/da/00ccda1234a1ff0c4298fac1fe38a051.jpg",
      title: "Location Name",
      stats: "13 ❤️  4 💬  116K 👁️"
    },
    {
      imgSrc: "https://i.pinimg.com/474x/c4/a1/75/c4a17565defc798bc9757a9e2abc7934.jpg",
      title: "Architecture Interior",
      stats: "30 ❤️  2 💬  153K 👁️"
    },
    {
      imgSrc: "https://i.pinimg.com/474x/c4/a1/75/c4a17565defc798bc9757a9e2abc7934.jpg",
      title: "Architecture Interior",
      stats: "30 ❤️  2 💬  153K 👁️"
    },
    {
      imgSrc: "https://i.pinimg.com/474x/c4/a1/75/c4a17565defc798bc9757a9e2abc7934.jpg",
      title: "Architecture Interior",
      stats: "30 ❤️  2 💬  153K 👁️"
    },
    {
      imgSrc: "https://i.pinimg.com/474x/c4/a1/75/c4a17565defc798bc9757a9e2abc7934.jpg",
      title: "Architecture Interior",
      stats: "30 ❤️  2 💬  153K 👁️"
    },
    {
      imgSrc: "https://i.pinimg.com/474x/c4/a1/75/c4a17565defc798bc9757a9e2abc7934.jpg",
      title: "Architecture Interior",
      stats: "30 ❤️  2 💬  153K 👁️"
    },
    {
      imgSrc: "https://i.pinimg.com/474x/c4/a1/75/c4a17565defc798bc9757a9e2abc7934.jpg",
      title: "Architecture Interior",
      stats: "30 ❤️  2 💬  153K 👁️"
    },
    {
      imgSrc: "https://i.pinimg.com/474x/c4/a1/75/c4a17565defc798bc9757a9e2abc7934.jpg",
      title: "Architecture Interior",
      stats: "30 ❤️  2 💬  153K 👁️"
    },
    {
      imgSrc: "https://i.pinimg.com/474x/c4/a1/75/c4a17565defc798bc9757a9e2abc7934.jpg",
      title: "Architecture Interior",
      stats: "30 ❤️  2 💬  153K 👁️"
    }
  ];

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-blue-600">Khắn vừng</div>
          <nav>
            <ul className="flex space-x-6">
              <li><a href="#" className="text-gray-700 hover:text-blue-500">Explore</a></li>
              <li><a href="#" className="text-gray-700 hover:text-blue-500">About</a></li>
              <li><a href="#" className="text-gray-700 hover:text-blue-500">Pricing</a></li>
              <li><a href="#" className="text-gray-700 hover:text-blue-500">Support</a></li>
              <li><a href="#" className="text-gray-700 hover:text-blue-500">Sign-in</a></li>
              <li><a href="#" className="text-orange-500 font-bold">Register</a></li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {cardsData.map((card, index) => (
            <Card 
              key={index}
              imgSrc={card.imgSrc}
              title={card.title}
              stats={card.stats}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

const Card = ({ imgSrc, title, stats }) => {
  return (
    <div className="card bg-white p-4 shadow rounded-lg relative w-full">
      <img src={imgSrc} alt="Image" className="w-full h-52 object-cover rounded" />
      <div className="absolute top-2 right-2 bg-black text-white text-sm px-2 py-1 rounded">360°</div>
      <div className="mt-2">
        <h2 className="font-bold text-gray-800">{title}</h2>
        <div className="text-sm text-gray-600 flex justify-between">
          <div>{stats}</div>
        </div>
      </div>
    </div>
  );
};

export default TourList;
