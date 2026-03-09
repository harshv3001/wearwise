'use client';
import { useState, useEffect } from 'react';

import Carousel from '../../../features/carousel/component/Carousel.jsx';
import { useClosetItemsQuery } from '../../../features/closet/hooks/useClosetItemsQuery.js';


export default function OutfitGeneratorPage() {
  const [categories, setCategories] = useState(["hats"]);
  const [closetData, setClosetData] = useState({});
  
  const {data: closetItems } = useClosetItemsQuery("hats");
    // have async data be populated to an Object where key is the category name?

  const removalCallback = (categoryName) => { setCategories(categories.filter(a => a != categoryName)); }

    return (
    <main style={{ padding: 24 }}>
      <h1>Make an Outfit</h1>
      <p>Also protected ✅</p>
      { closetItems ? (
          categories.map((categoryName, i) => {
            return (
              <Carousel key={i} data={closetItems} categoryName={categoryName} removalCallback={() => removalCallback(categoryName)}/>
            );
          }) 
        ) : (<></>)
      }
    </main>
  );
}
