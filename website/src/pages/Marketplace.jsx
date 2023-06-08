import { useState, useEffect, useReducer } from 'react';
import Filter from '../components/Marketplace/Filter';
import Form from '../components/Marketplace/Form';
import Card from '../components/Marketplace/Card';
// import { MetaTags } from "react-meta-tags";
import { fetchCachedData, setErrorMessage } from '../misc';
import LoadingScreen from '../components/LoadingScreen';
import DialogBox from '../components/DialogBox';
import PageSelector from '../components/PageSelector';
import { fetchWithToken } from '../firebase';

const NUM_BOOKS_PER_PAGE = 20;

const FILTERS = {
  SUBJECT: [
    'polski',
    'angielski',
    'niemiecki',
    'hiszpański',
    'francuski',
    'matematyka',
    'fizyka',
    'chemia',
    'biologia',
    'biofizyka',
    'informatyka',
    'ekonomia',
    'przedsiębiorczość',
    'geografia',
    'historia',
    'HiT',
    'WOS',
    'EDB',
    'kultura',
    'plastyka',
    'TOK',
    'inny',
  ],
  GRADE: ['1', '2', '3', '4', 'DP1/DP2 (IB)'],
  QUALITY: ['nowa', 'jak nowa', 'lekko używana', 'bardzo używana'],
  LEVEL: ['rozszerzony', 'podstawowy'],
  PUBLISHER: [
    'Nowa Era',
    'OPERON',
    'WSiP',
    'Wiking',
    'Oficyna Edukacyjna',
    'Oxford University Press',
    'Pearson',
    'Haese Mathematics',
  ],
};

const QUERY_DEFAULT_VALUE = Object.fromEntries(Object.keys(FILTERS).map((key) => [key, []]));

const FILTER_TRANSLATIONS = {
  SUBJECT: { userFriendlyName: 'Przedmiot', databaseName: 'subject' },
  GRADE: { userFriendlyName: 'Klasa', databaseName: 'studentClass' },
  QUALITY: { userFriendlyName: 'Jakość', databaseName: 'quality' },
  LEVEL: { userFriendlyName: 'Poziom', databaseName: 'level' },
  PUBLISHER: { userFriendlyName: 'Wydawnictwo', databaseName: 'publisher' },
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'ADD':
      return { ...state, [action.filterGroup]: [...state[action.filterGroup], action.filter] };
    case 'REMOVE':
      return {
        ...state,
        [action.filterGroup]: state[action.filterGroup].filter(
          (filter) => !(filter === action.filter)
        ),
      };
    case 'RESET':
      return QUERY_DEFAULT_VALUE;
    default:
      throw new Error();
  }
};

function filterOffer(offer, query) {
  function filterMatches(filterGroup) {
    if (query[filterGroup].length === 0) return true;
    const translatedFilterGroup = FILTER_TRANSLATIONS[filterGroup].databaseName;
    const offerValue = offer[translatedFilterGroup];
    const targetValue = query[filterGroup];
    return query[filterGroup].includes(offerValue);
  }

  return !Object.keys(query).some((filterGroup) => !filterMatches(filterGroup));
}

const Marketplace = ({ setPage, email, userInfo }) => {
  const [query, dispatch] = useReducer(reducer, QUERY_DEFAULT_VALUE);
  const [data, setData] = useState({ contents: [] });
  const [loaded, setLoaded] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [popupDelete, setPopupDelete] = useState(false);
  const [deletedBookID, setDeletedBookID] = useState(null);
  const [popupSuccess, setPopupSuccess] = useState(false);
  const [popupError, setPopupError] = useState(false);
  const [errorCode, setErrorCode] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  function fetchBooks(force = false) {
    const fetchArgs = {
      setData,
      setLoaded,
      updateCache: force,
      params: { all: true },
    };
    fetchCachedData('books', '/books', fetchArgs);
  }

  useEffect(() => {
    setPage('marketplace');
    fetchBooks();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [query]);

  function handlePostResponse(res) {
    if (res.ok) {
      fetchBooks(true);
      setLoaded(false);
      setPopupSuccess(true);
    } else {
      setErrorCode(res.status);
      setErrorMessage(res, setPopupError);
    }
  }

  const getCard = (offerProperties, idx) => (
    <Card
      key={`${offerProperties.title}-${idx}`}
      offerData={offerProperties}
      userEmail={email}
      userInfo={userInfo}
      setPopupDelete={setPopupDelete}
      setDeletedBookID={setDeletedBookID}
    />
  );

  // generate filters based on avialable ones
  const generateFilterButtons = (filterGroup) =>
    FILTERS[filterGroup].map((filter, idx) => (
      <Filter
        key={`${filter}-${idx}`}
        name={filter}
        filterGroup={filterGroup}
        active={query[filterGroup].includes(filter)}
        onChange={dispatch}
      />
    ));

  const _handleDelete = () => {
    fetchWithToken('/books/' + deletedBookID, 'DELETE').then((res) => {
      console.debug(res);
      fetchBooks(true);
      setLoaded(false);
    });
  };

  if (!loaded) {
    return <LoadingScreen />;
  }

  const numFiltersApplied = Object.values(query).reduce(
    (total, filter) => total + (filter.length > 0 ? 1 : 0),
    0
  );

  const filteredOffers = data.contents.filter((offer) => filterOffer(offer, query));
  const lastBookIdx = 1 + currentPage * NUM_BOOKS_PER_PAGE;
  const paginatedOffers = filteredOffers.slice(lastBookIdx - NUM_BOOKS_PER_PAGE, lastBookIdx);

  return (
    <div className="w-11/12 xl:w-10/12 flex flex-col justify-center align-top min-h-screen pt-6 md:pt-10">
      <DialogBox
        header="Sukces!"
        content="Pomyślnie dodano książkę do kiermaszu."
        duration={2000}
        isVisible={popupSuccess}
        setVisible={setPopupSuccess}
      />
      <DialogBox
        header="Uwaga!"
        content="Czy na pewno chcesz usunąć zawartość? Ta akcja jest nieodwracalna."
        type="DIALOG"
        buttonOneLabel="Nie usuwaj"
        buttonTwoLabel="Usuń"
        buttonTwoCallback={_handleDelete}
        isVisible={popupDelete}
        setVisible={setPopupDelete}
      />
      <DialogBox
        header={`Bład! (HTTP ${errorCode})`}
        content="Nastąpił błąd podczas dodawania książki. Spróbuj ponownie."
        extra={popupError}
        type="DIALOG"
        buttonOneLabel="Ok"
        isVisible={popupError}
        setVisible={setPopupError}
      />
      <div className="min-h-screen flex flex-col">
        <Form
          isOpen={openForm}
          closeForm={() => setOpenForm(false)}
          options={FILTERS}
          handlePostResponse={handlePostResponse}
        />
        {email ? (
          <Button label="Dodaj podręcznik" onClick={() => setOpenForm(true)} />
        ) : (
          <p className="text-text4 text-sm py-1 mb-2">Zaloguj się, aby dodać podręcznik</p>
        )}
        <div className="flex flex-col flex-wrap gap-1 mb-8">
          <Button
            label={
              `${showFilters ? 'Ukryj' : 'Pokaż'} filtry` +
              (numFiltersApplied > 0 ? ` (${numFiltersApplied})` : '')
            }
            onClick={() => setShowFilters((oldVal) => !oldVal)}
          />
          {showFilters ? (
            <form onSubmit={(event) => event.preventDefault()}>
              <div className="flex flex-row gap-3">
                {Object.entries(FILTER_TRANSLATIONS).map(
                  ([filterGroup, filterTranslation], idx) => (
                    <fieldset
                      className="flex flex-col flex-wrap gap-1"
                      key={`${filterGroup}-${idx}`}
                    >
                      {filterTranslation.userFriendlyName}
                      {generateFilterButtons(filterGroup)}
                    </fieldset>
                  )
                )}
              </div>
            </form>
          ) : null}
          <Button
            label="Resetuj filtry"
            onClick={() => dispatch({ type: 'RESET' })}
            disabled={numFiltersApplied === 0}
          />
        </div>
        <div className="grid items-stretch grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-5 my-6 md:my-9 md:gap-4 lg:gap-5 w-full">
          {paginatedOffers.map(getCard)}
        </div>
        <PageSelector
          page={currentPage}
          numPages={Math.ceil(filteredOffers.length / NUM_BOOKS_PER_PAGE)}
          onChange={setCurrentPage}
        />
      </div>
    </div>
  );
};

const Button = ({ label, onClick, disabled = false }) => (
  <div className="flex flex-row flex-wrap gap-1 mb-2">
    <button
      className={`rounded-md inline-block px-3 py-1 transition-all duration-75 ${
        disabled
          ? 'text-[#ededed] bg-primaryDark cursor-not-allowed'
          : 'text-white bg-primaryhover bg-primary'
      }`}
      onClick={onClick}
      disabled={disabled}
    >
      <p className="p-0 m-0 text-sm" style={{ textTransform: 'uppercase' }}>
        {label}
      </p>
    </button>
  </div>
);

export default Marketplace;
