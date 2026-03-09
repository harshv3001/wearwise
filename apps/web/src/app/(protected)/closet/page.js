"use client";
import { useEffect, useState } from 'react';
import { useClosetItemsQuery } from "@/features/closet/hooks/useClosetItemsQuery";
import Carousel from "../../../features/carousel/component/Carousel.jsx";
import Button from "../../components/ui/Button";
import Accordion from "../../components/ui/Accordion/Accordion.jsx";

export default function ClosetPage() {
    const [categories, setCategories] = useState({});
    const { data: allClosetItems } = useClosetItemsQuery();

    useEffect(() => {
        let ignore = false;
        if (allClosetItems) {
            const closetData = {};
            allClosetItems.forEach(ci => {
                if (!closetData.hasOwnProperty(ci.category)) {
                    closetData[ci.category] = [ci];
                } else {
                    closetData[ci.category].push(ci);
                }
            });
            setCategories(closetData);
        }
            
        return () => { ignore = true; }
    }, [allClosetItems]);



    // currently not needed for this page
    // const parentSetSelectedCallback = closetItemId => {console.log(closetItemId)}
    // const removeCategory = categoryName => {
    //     const newObj = {};
    //     for (let key in categories) {
    //         if (key != categoryName) {
    //             newObj[key] = categories[key];
    //         }
    //     }
    //     setCategories(newObj);
    // };

    // closing an accordion does not trigger unloading data from this app's state; should not trigger re-rendering in this app
  return (
    <main className="px-2">
      <h1>My Closet</h1>
      <div className="xl:flex lg:col-3 md:col-1 break-after-column lg:w-[90vw] w-fit mt-0 m-auto gap-x-4">
      {
          allClosetItems ? (
            Object.keys(categories).map((categoryName, i) => {
                
                const props = { 
                  categoryName,
                  closetItems: categories[categoryName],
                  parentSetSelectedCallback: () => {},
                  removalCallback: () => {}
                };

                return (
                    <Accordion title={categoryName} startOpened={i == 0} key={i}>
                      <Carousel disableRemoval hideTitle
                        key={i} 
                        {...props}
                      />
                    </Accordion>
                );

            })
          ) : (<></>)
      }
      </div>
    </main>
  );
}
