import React from 'react';

const ImageCollage = () => {
  // Fixed image URLs for the 2x2 grid
  const imageUrls = [
    'https://images.moneycontrol.com/static-mcnews/2025/01/20250107064538_autism.png?impolicy=website&width=770&height=431',
    'https://sp-ao.shortpixel.ai/client/to_webp,q_glossy,ret_img/https://freshstartmediation.com.au/wp-content/uploads/2022/04/alireza-attari-SBIak0pKUIE-unsplash-1-scaled.jpg',
    'https://www.parents.com/thmb/WcLSDMCaiNkFz1cOEs_JxXn4Vic=/750x0/filters:no_upscale():max_bytes(150000):strip_icc():format(webp)/Parents-GettyImages-1270685807-653a4bb43098448a8f29719a001873f9.jpg',
    'https://legacy-cdn.abilities.com/neurodivergent-kids-3.jpg'
  ];
  
  return (
    <div className="max-w-xl mt-[-16vh] ml-7 mx-auto p-4">
          {/* Main grid container */}
      <div className="grid grid-cols-2 gap-4">
        {imageUrls.map((url, index) => (
          <div key={index} className="aspect-square overflow-hidden rounded-lg">
            <img 
              src={url} 
              alt={`Grid image ${index + 1}`}
              className="w-full h-full object-cover transition-transform hover:scale-105"
              onError={(e) => {
                e.target.src = "/api/placeholder/200/200";
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageCollage;