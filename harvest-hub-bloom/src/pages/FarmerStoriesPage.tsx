
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Star, MapPin, Calendar, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Story {
  id: number;
  name: string;
  location: string;
  story: string;
  farmType: string;
  rating: number;
  experience: string;
  achievements: string[];
  image?: string;
}

// Stories data moved to translation files - this is just for TypeScript interface
const stories: Story[] = [
  { id: 1, name: "", location: "", story: "", farmType: "", rating: 0, experience: "", achievements: [], image: "" },
  { id: 2, name: "", location: "", story: "", farmType: "", rating: 0, experience: "", achievements: [], image: "" },
  { id: 3, name: "", location: "", story: "", farmType: "", rating: 0, experience: "", achievements: [], image: "" },
  { id: 4, name: "", location: "", story: "", farmType: "", rating: 0, experience: "", achievements: [], image: "" },
  { id: 5, name: "", location: "", story: "", farmType: "", rating: 0, experience: "", achievements: [], image: "" },
  { id: 6, name: "", location: "", story: "", farmType: "", rating: 0, experience: "", achievements: [], image: "" }
];

const StoryCard = ({ storyId }: { storyId: number }) => {
  const { t } = useTranslation();
  const [isHovered, setIsHovered] = useState(false);

  // Get story data from translations
  const story = {
    id: storyId,
    name: t(`farmerStories.${storyId}.name`),
    location: t(`farmerStories.${storyId}.location`),
    story: t(`farmerStories.${storyId}.story`),
    farmType: t(`farmerStories.${storyId}.farmType`),
    rating: parseFloat(t(`farmerStories.${storyId}.rating`)),
    experience: t(`farmerStories.${storyId}.experience`),
    achievements: t(`farmerStories.${storyId}.achievements`, { returnObjects: true }) as string[],
    image: `https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80` // Keep original image URLs
  };

  return (
    <Card 
      className="bg-white dark:bg-gray-700 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={story.image} 
          alt={story.name}
          className="w-full h-full object-cover transition-transform duration-300"
          style={{
            transform: isHovered ? 'scale(1.1)' : 'scale(1)'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">{story.name}</h3>
            <div className="flex items-center space-x-1 bg-white/20 backdrop-blur-sm rounded-full px-2 py-1">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="text-white text-sm font-medium">{story.rating}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2 mt-1">
            <MapPin className="h-4 w-4 text-white/80" />
            <span className="text-white/80 text-sm">{story.location}</span>
          </div>
        </div>
      </div>
      
      <CardContent className="p-6">
        <div className="mb-4">
          <span className="inline-block bg-harvest-green/10 text-harvest-green px-3 py-1 rounded-full text-sm font-medium">
            {story.farmType}
          </span>
        </div>
        
        <p className="text-gray-600 dark:text-white mb-4 leading-relaxed">
          {story.story}
        </p>
        
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-white">
            <Calendar className="h-4 w-4" />
            <span>{story.experience} {t('farmer.stories.experience')}</span>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-white">
              <Users className="h-4 w-4" />
              <span className="font-medium">{t('farmer.stories.keyAchievements')}:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {story.achievements.map((achievement, index) => (
                <span 
                  key={index}
                  className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white px-2 py-1 rounded-md text-xs"
                >
                  {achievement}
                </span>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const FarmerStoriesPage = () => {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { value: 'all', label: t('farmer.stories.allStories') },
    { value: 'organic', label: t('farmer.stories.organicFarming') },
    { value: 'modern', label: t('farmer.stories.modernAgriculture') },
    { value: 'integrated', label: t('farmer.stories.integratedFarming') },
    { value: 'women', label: t('farmer.stories.womenFarmers') }
  ];

  // Get all story IDs for filtering
  const storyIds = [1, 2, 3, 4, 5, 6];
  
  const filteredStoryIds = selectedCategory === 'all' 
    ? storyIds 
    : storyIds.filter(id => {
        const farmType = t(`farmerStories.${id}.farmType`).toLowerCase();
        const name = t(`farmerStories.${id}.name`).toLowerCase();
        return farmType.includes(selectedCategory) || name.includes(selectedCategory);
      });

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-orange-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex items-center justify-center mb-4">
            <Link 
              to="/" 
              className="inline-flex items-center text-harvest-green hover:text-harvest-green-dark mr-6"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              {t('farmer.stories.backToHome')}
            </Link>
            <div className="bg-harvest-green p-3 rounded-full mr-4">
              <Users className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">{t('farmer.stories.title')}</h1>
          </div>
          <p className="text-gray-600 dark:text-white text-lg max-w-2xl mx-auto">
            {t('farmer.stories.subtitle')}
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex justify-center mb-8">
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <Button
                key={category.value}
                variant={selectedCategory === category.value ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.value)}
                className={`rounded-full px-6 py-2 ${
                  selectedCategory === category.value 
                    ? 'bg-harvest-green text-white' 
                    : 'border-harvest-green text-harvest-green hover:bg-harvest-green hover:text-white'
                }`}
              >
                {category.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Stories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredStoryIds.map((storyId, index) => (
            <div 
              key={storyId} 
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <StoryCard storyId={storyId} />
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <Card className="bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {t('farmer.stories.shareStory')}
              </h3>
              <p className="text-gray-600 dark:text-white mb-6 max-w-2xl mx-auto">
                {t('farmer.stories.shareStoryDescription')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-harvest-green hover:bg-harvest-green-dark text-white px-8 py-3">
                  {t('farmer.stories.shareStory')}
                </Button>
                <Button variant="outline" className="border-harvest-green text-harvest-green hover:bg-harvest-green hover:text-white px-8 py-3">
                  {t('farmer.stories.learnMore')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FarmerStoriesPage; 