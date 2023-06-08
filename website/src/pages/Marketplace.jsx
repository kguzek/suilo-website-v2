import { useState, useEffect, useReducer } from 'react';
import Filter from '../components/Marketplace/Filter';
import Form from '../components/Marketplace/Form';
import Card from '../components/Marketplace/Card';
// import { MetaTags } from "react-meta-tags";
import { fetchCachedData, setErrorMessage } from '../misc';
import LoadingScreen from '../components/LoadingScreen';
import DialogBox from '../components/DialogBox';
import { fetchWithToken } from '../firebase';

const TEST_OFFERS = [
  {
    title: 'Książka 1',
    user: 'User 1',
    name: 'Użytkownik 1',
    studentClass: '2 DP', // from list 1,2,3,4 lic or 1,2 DP
    email: 'test@email.com',
    quality: 'używana', // from list
    publisher: 'Oxford',
    subject: 'matematyka', // from list
    year: '2012',
    photo:
      'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1473&q=80', // automated based on subject, or link provided by user
    price: '24', // only integers
    level: 'podstawowy', // from list
  },
  {
    title: 'Książka 2',
    user: 'User 2',
    name: 'Użytkownik 2',
    studentClass: '2. liceum', // from list 1,2,3,4 lic or 1,2 DP
    email: 'test@email.com',
    quality: 'nowa', // from list
    publisher: 'Nowa Era',
    subject: 'polski', // from list
    year: '2012',
    photo:
      'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1473&q=80', // automated based on subject, or link provided by user
    price: '24', // only integers
    level: 'rozszerzony', // from list
  },
  {
    title: 'Książka 3',
    user: 'User 3',
    name: 'Użytkownik 3',
    studentClass: '1. DP', // from list 1,2,3,4 lic or 1,2 DP
    email: 'test@email.com',
    quality: 'używana', // from list
    publisher: 'Operon',
    subject: 'historia', // from list
    year: '2003',
    photo:
      'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1473&q=80', // automated based on subject, or link provided by user
    price: '12', // only integers
    level: 'rozszerzony', // from list
  },
  {
    title: 'Książka 4',
    user: 'User 4',
    name: 'Użytkownik 4',
    studentClass: '4. liceum', // from list 1,2,3,4 lic or 1,2 DP
    email: 'test@email.com',
    quality: 'nowa', // from list
    publisher: 'Nowa Era',
    subject: 'infomatyka', // from list
    year: '2020',
    photo:
      'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1473&q=80', // automated based on subject, or link provided by user
    price: '120', // only integers
    level: 'rozszerzony', // from list
  },
  {
    title: 'Książka 5',
    user: 'User 5',
    name: 'Użytkownik 5',
    studentClass: '2. liceum', // from list 1,2,3,4 lic or 1,2 DP
    email: 'test@email.com',
    quality: 'nowa', // from list
    publisher: 'Nowa Era',
    subject: 'j. angielski', // from list
    year: '2015',
    photo:
      'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1473&q=80', // automated based on subject, or link provided by user
    price: '72', // only integers
    level: 'podstawowy', // from list
  },
];

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
    console.log(offerValue, targetValue);
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
    console.log(userInfo);
    fetchBooks();
  }, []);

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

  // generate offers based on querry
  const _generateOffers = (data) => {
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

    return data.filter((offer) => filterOffer(offer, query)).map(getCard);
  };

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
          <Button label="Resetuj filtry" onClick={() => dispatch({ type: 'RESET' })} />
        </div>
        <div className="grid items-stretch grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-5 my-6 md:my-9 md:gap-4 lg:gap-5 w-full">
          {_generateOffers(data.contents)}
        </div>
      </div>
    </div>
  );
};

const Button = ({ label, onClick }) => (
  <div className="flex flex-row flex-wrap gap-1 mb-2">
    <button
      className="bg-primary text-white rounded-md inline-block px-3 py-1 transition-all duration-75 hover:bg-primaryDark"
      onClick={onClick}
    >
      <p className="p-0 m-0 text-sm" style={{ textTransform: 'uppercase' }}>
        {label}
      </p>
    </button>
  </div>
);

export default Marketplace;
