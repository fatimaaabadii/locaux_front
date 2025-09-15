"use client";
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper-bundle.css';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Navigation, Pagination } from 'swiper/modules';
import { useQuery } from "@tanstack/react-query";
import { api, getDelegations, getUsers, getCurrentUser, getBene, getEtablissements,getArticles } from "/src/api";

const ArticleCarousel = () => {
    const { data: articles,refetch} = useQuery({
        queryKey: ['articles'],
        queryFn: getArticles(),
      });
      function stripHtmlTags(html) {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return doc.body.textContent || "";
      };
      const sortedArticles = articles ? [...articles].sort((a, b) => b.id - a.id).slice(0, 10) : [];
      return (
        <Swiper
            spaceBetween={50}
            slidesPerView={1}
            navigation={true}
            pagination={{ clickable: true }}
            modules={[Navigation, Pagination]}
        >
            {sortedArticles?.map(article => (
                <SwiperSlide key={article.id}>
                    <div
                        className=" mt-16 w-full relative bg-cover flex items-center justify-center bg-gray-300"
                        style={{
                            height: '400px',
                            backgroundPosition: 'center center',
                            backgroundImage: `url(${article.imageUrl})`,
                        }}
                    >
                        <div className="w-full h-full flex items-center justify-center bg-white/80 px-8 py-6">
                            <div className="text-center space-y-4">
                                <h1 className="text-3xl font-bold text-primary-accent-800">
                                    {article.title}
                                </h1>
                                <div
                                    className="text-lg font-medium text-primary-black-700 prose"
                                    dangerouslySetInnerHTML={{ __html: article.content }}
                                />
                            
                            </div>
                        </div>
                    </div>
                </SwiperSlide>
            ))}
        </Swiper>
    );
};

export default ArticleCarousel;