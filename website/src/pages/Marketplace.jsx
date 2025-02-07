import { useState, useEffect, useReducer, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import Filter from '../components/Marketplace/Filter';
import Form from '../components/Marketplace/Form';
import Card from '../components/Marketplace/Card';
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
    'Pearson',
    'Oficyna Edukacyjna',
    'Oxford University Press',
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
    return query[filterGroup].includes(offerValue);
  }

  return !Object.keys(query).some((filterGroup) => !filterMatches(filterGroup));
}

const Marketplace = ({ setPage, email, userInfo, screenWidth }) => {
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
  }, [setPage]);

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

  const _handleDelete = () => {
    fetchWithToken('/books/' + deletedBookID, 'DELETE').then((res) => {
      console.debug(res);
      fetchBooks(true);
      setLoaded(false);
    });
  };

  const numFiltersApplied = Object.values(query).reduce(
    (total, filter) => total + (filter.length > 0 ? 1 : 0),
    0
  );

  const firstBookIdx = (currentPage - 1) * NUM_BOOKS_PER_PAGE;

  const filteredOffers = data.contents.filter((offer) => filterOffer(offer, query));
  const paginatedOffers = useMemo(
    () => filteredOffers.slice(firstBookIdx, firstBookIdx + NUM_BOOKS_PER_PAGE),
    [filteredOffers, firstBookIdx]
  );

  if (!loaded) {
    return <LoadingScreen />;
  }

  // generate filters based on avialable ones
  const generateFilterButtons = (filterGroup) => (
    <div
      className={`gap-1 ${screenWidth > 1200 ? 'grid' : 'flex flex-wrap'}`}
      style={{ gridAutoFlow: 'column', gridTemplateRows: 'auto '.repeat(5) }}
    >
      {FILTERS[filterGroup].map((filter, idx) => (
        <Filter
          key={`${filter}-${idx}`}
          name={filter}
          filterGroup={filterGroup}
          active={query[filterGroup].includes(filter)}
          onChange={dispatch}
        />
      ))}
    </div>
  );

  return (
    <div className="w-11/12 xl:w-10/12 flex flex-col justify-center align-top min-h-screen pt-6 md:pt-10">
      <Helmet>
        <title>Kiermasz | Samorząd Uczniowski I LO</title>
        <meta
          name="description"
          content="Kiermasz książek w I Liceum Ogólnokształcącym w Gliwicach."
        />
        <meta property="og:title" content="Kiermasz książek" />
        <meta property="og:image" content="" /> {/* TODO: ADD IMAGE */}
      </Helmet>
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
            label={`${showFilters ? 'Ukryj' : 'Pokaż'} filtry`}
            onClick={() => setShowFilters((oldVal) => !oldVal)}
          />
          {showFilters ? (
            <div className={`flex gap-3 mb-2 flex-${screenWidth > 800 ? 'row' : 'col'}`}>
              {Object.entries(FILTER_TRANSLATIONS).map(([filterGroup, filterTranslation], idx) => (
                <fieldset key={`${filterGroup}-${idx}`}>
                  {filterTranslation.userFriendlyName}
                  {query[filterGroup].length === 0 ? '' : ` (${query[filterGroup].length})`}
                  {generateFilterButtons(filterGroup)}
                </fieldset>
              ))}
            </div>
          ) : null}
          <Button
            label={'Wyczyść filtry' + (numFiltersApplied > 0 ? ` (${numFiltersApplied})` : '')}
            onClick={() => dispatch({ type: 'RESET' })}
            disabled={numFiltersApplied === 0}
          />
        </div>
        {filteredOffers.length === 0 ? (
          'Brak wyników. Spróbuj wyczyścić filtry.'
        ) : (
          <>
            {firstBookIdx + 1}-{paginatedOffers.length} z {filteredOffers.length}
            <div className="grid items-stretch grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-5 my-6 md:my-9 md:gap-4 lg:gap-5 w-full">
              {paginatedOffers.map(getCard)}
            </div>
            <PageSelector
              page={currentPage}
              numPages={Math.ceil(filteredOffers.length / NUM_BOOKS_PER_PAGE)}
              onChange={setCurrentPage}
            />
          </>
        )}
      </div>
    </div>
  );
};

const Button = ({ label, disabled = false, ...attributes }) => (
  <div className="flex flex-row flex-wrap gap-1 mb-2">
    <button
      className={
        'rounded-md inline-block px-3 py-1 transition-all duration-75 ' +
        (disabled
          ? 'text-gray-400 bg-gray-300 cursor-not-allowed'
          : 'text-white bg-primaryhover bg-primary')
      }
      disabled={disabled}
      {...attributes}
    >
      <p className="p-0 m-0 text-sm" style={{ textTransform: 'uppercase' }}>
        {label}
      </p>
    </button>
  </div>
);

export default Marketplace;
