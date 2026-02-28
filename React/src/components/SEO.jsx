import { useEffect } from 'react';

/**
 * SEO компонент для управления мета-тегами страницы
 * Совместим с React 19
 */
const SEO = ({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  noindex = false,
  structuredData,
}) => {
  const siteUrl = 'https://fluvion.by';
  const siteName = 'Fluvion';
  const defaultImage = `${siteUrl}/logo.png`;
  
  const fullTitle = title ? `${title} | ${siteName}` : `${siteName} - Доставка товаров из Китая в Беларусь`;
  const fullUrl = url ? `${siteUrl}${url}` : siteUrl;
  const ogImage = image || defaultImage;

  useEffect(() => {
    // Обновляем title
    document.title = fullTitle;

    // Функция для обновления или создания мета-тега
    const updateMetaTag = (property, content, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attribute}="${property}"]`);
      
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, property);
        document.head.appendChild(meta);
      }
      
      meta.setAttribute('content', content);
    };

    // Функция для обновления или создания link тега
    const updateLinkTag = (rel, href) => {
      let link = document.querySelector(`link[rel="${rel}"]`);
      
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', rel);
        document.head.appendChild(link);
      }
      
      link.setAttribute('href', href);
    };

    // Основные мета-теги
    if (description) {
      updateMetaTag('description', description);
    }
    
    if (keywords) {
      updateMetaTag('keywords', keywords);
    }

    // Robots
    updateMetaTag('robots', noindex ? 'noindex, nofollow' : 'index, follow');

    // Open Graph
    updateMetaTag('og:type', type, true);
    updateMetaTag('og:url', fullUrl, true);
    updateMetaTag('og:title', fullTitle, true);
    if (description) {
      updateMetaTag('og:description', description, true);
    }
    updateMetaTag('og:image', ogImage, true);
    updateMetaTag('og:site_name', siteName, true);
    updateMetaTag('og:locale', 'ru_RU', true);

    // Twitter Card
    updateMetaTag('twitter:card', 'summary_large_image', true);
    updateMetaTag('twitter:url', fullUrl, true);
    updateMetaTag('twitter:title', fullTitle, true);
    if (description) {
      updateMetaTag('twitter:description', description, true);
    }
    updateMetaTag('twitter:image', ogImage, true);

    // Canonical URL
    updateLinkTag('canonical', fullUrl);

    // Structured Data (JSON-LD)
    if (structuredData) {
      let script = document.querySelector('script[type="application/ld+json"]');
      if (!script) {
        script = document.createElement('script');
        script.setAttribute('type', 'application/ld+json');
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(structuredData);
    }

    // Cleanup function
    return () => {
      // Не удаляем мета-теги при размонтировании, так как они могут быть нужны для других страниц
      // Просто оставляем их как есть
    };
  }, [fullTitle, description, keywords, ogImage, fullUrl, type, noindex, structuredData]);

  return null;
};

export default SEO;






























