import { useEffect , useState} from "react";
import { Container } from "react-bootstrap";
import algoliasearch from "algoliasearch";
import { InstantSearch, SearchBox, Hits , connectStateResults} from 'react-instantsearch-dom';
import { NavLink } from "react-router-dom";
import { indexedAlgoliaRoom } from "../../interfaces";
// import 'instantsearch.css/themes/satellite.css';


const searchClient = algoliasearch("U7MCDOZVTR","7fe2ceefac15f2a2046f9d6dd8e55837"); // appid, search api key

interface searchHitProp {
  hit: indexedAlgoliaRoom;
}

export default function SearchBar() {
  const [searchState, setSearchState] = useState("");
  const [lastHit, setLastHit] = useState(false);


  // Highlights the text in the searchbox in both title and description
  const highlightText = (text: string, highlight: string) => {
    // regex - splits text into array which separates matching highlight into its in slot in the array(still also contains the rest of the text)
    const parts = text.split(new RegExp(`(${highlight})`, 'gi')); // regex for highlight in text, global, case-insensitive (gi)
    return (
      <>
          {parts.map((part, index) => 
            part.toLowerCase() === highlight.toLowerCase() ? 
            <span key={index} style={{ backgroundColor: 'yellow' }}>{part}</span>
            : 
            part
          )}
        </>
    );
  };

  // Listener to see if the last search had any hits. Used to remove empty container on no hits.
  const SearchResultsListener = connectStateResults(({ searchResults }) => {
    useEffect(() => {
        if (searchResults && searchResults.nbHits > 0) {
          setLastHit(true);
        } else {
          setLastHit(false);
        }
    }, [searchResults]);
    return null;
});

  // Hits element, displays the search results.
  const Hit = ({ hit }: searchHitProp) => {

    return (
      <NavLink to={`/room/${hit.objectID}`}>
        <div className="hit">
          <div style={{ width: "100px", height: "100px"}} className='d-flex align-items-center justify-content-center'>
            <img src={hit.imageURL} className="hit-image"/>
          </div>
          <div className="hit-content">
            <h4 className="hit-name">
              {highlightText(hit.Name, searchState)}
            </h4>
            <p className="hit-description">
                {highlightText(hit.Description, searchState)}
            </p>
          </div>
        </div>
      </NavLink>
    );
  };

  return (
    <>
      <InstantSearch searchClient={searchClient} indexName="QuizCompass">
          <SearchBox onChange={(event) => setSearchState(event.currentTarget.value)}/>
        <div className='square bg-primary rounded' style={{width: "100%", }}>

        
        {searchState && 
          <Container className={lastHit ? 'searchcard':'no-searchcard'}>
            <Hits hitComponent={Hit} />
            <SearchResultsListener/>
          </Container>
        }
        </div>
      </InstantSearch>
      <style>{`
        input[type="search"]::-webkit-search-cancel-button {
          -webkit-appearance: none; 
          height: 16px;  
          width: 16px;  
          background: url('data:image/svg+xml;utf8,<svg fill="black" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M3 3 L21 21 M21 3 L3 21" stroke="black" stroke-width="5" /></svg>');
          cursor: pointer;
        }

        .ais-SearchBox-input {
          color: black; 
          background: white; 
          border: 1px solid #ccc; 
          padding: 10px;
          border-radius: 18px;
        }

        .ais-SearchBox-input:focus {
          border-color: blue;
        }

        .ais-SearchBox-submit {
          display: none;
        }

        .ais-SearchBox-reset {
          display: none;
        }
        .searchcard {
          overflow-y: scroll;
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none;
          border-radius: 0 10px 10px 10px;
          position: absolute;
          float: left;
          border: 1px solid #000;
          padding: 5px;
          opacity:0.98;
          background: white;
          z-index:99;
          max-height: 300px;  
          overflow-y: scroll;
        }
        .no-searchcard{
          display: none;
        }
        .hit {
          border: 1px solid #ccc;
          display: flex;
          margin-bottom: 3px;
          padding: 10px;
          align-items: center;
          background: white;
          opacity: 1;
          position: relative;
          top: 100%;
          left: 0;
          width: 100%;  
          z-index: 100;
          max-height: 300px;  
          overflow-y: auto;  
        }
        .hit:hover{
          background: #e0e0e0;
        }
        .hit-image {
          width: 100;
          height: 100%;
          object-fit: contain;
          overflow: hidden;
        }
        .hit-content {
          flex: 1;
          overflow: hidden;
          padding: 10px;
        }
        .hit-name {
          font-size: 1.2em;
          margin-bottom: 5px;
          color: #333;
        }
        .hit-description {
          font-size: 0.9em;
          color: #666;
          overflow: hidden;
        }

        ul {
          list-style-type: none;
          padding: 0;
          margin: 0;          
        }
      `}
      </style>
    </>
  );
}