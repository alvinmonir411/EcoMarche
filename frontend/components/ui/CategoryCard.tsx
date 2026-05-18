import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getImageUrl } from '@/utils/image';
import { FASTLAIN_PLACEHOLDER } from '@/utils/fashionImages';

interface CategoryCardProps {
  name: string;
  image?: string;
  href: string;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ name, image, href }) => {
  const [imageSrc, setImageSrc] = React.useState(getImageUrl(image));

  return (
    <Link href={href} className="group relative overflow-hidden rounded-[32px] aspect-[4/3] bg-accent block border border-gray-50 shadow-sm transition-all duration-500 hover:shadow-xl hover:shadow-secondary/5">
      {image ? (
        <Image
          src={imageSrc}
          alt={name}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          onError={() => setImageSrc(FASTLAIN_PLACEHOLDER)}
          className="object-cover transition-transform duration-1000 ease-in-out group-hover:scale-110"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs font-bold uppercase tracking-widest">
          {name}
        </div>
      )}
      
      {/* Content Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="absolute bottom-6 left-6 z-10">
        <div className="bg-white/90 backdrop-blur-md px-5 py-2.5 rounded-2xl shadow-sm border border-white/50">
           <h3 className="text-secondary text-xs font-black uppercase tracking-widest mb-1">{name}</h3>
           <p className="text-[10px] font-bold text-primary uppercase tracking-tighter group-hover:translate-x-1 transition-transform">Explore Now →</p>
        </div>
      </div>
    </Link>
  );
};

export default CategoryCard;
