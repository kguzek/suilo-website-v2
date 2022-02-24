const { createSingleDocument, dateToTimestamp } = require("./util");

/** Generate a random date from between the start and end dates. */
function randomDateFromInterval(start, end) {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
}

const testDataPrimary = [
  {
    title: `Adam Sarkowicz: "uczymy do ostatniego żywego ucznia" `,
    textShort: `W dobie pandemi Koronaświrusa, Adam Sarkowicz wypowiada mocne słowa: "Będziemy prowadzili zajęcia szkolne do ostatniego żywego ucznia." Udanych Igrzysk i niech los zawsze wam sprzyja!`,
    photo: `https://www.sportslaski.pl/static/thumbnail/article/med/13452.jpg`,
  },
  {
    title: `SpeedDating edycja 2022 - informacje`,
    textShort: `Nowa edycja SpeedDating'u już przednami, w tym poście znajdziecie wszystkie przydatne informacje dotyczące tegorocznej edycji wydarzenia.`,
    photo: `https://images.unsplash.com/photo-1544911845-1f34a3eb46b1?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80`,
  },
  {
    title: `PiS znowu atakuje polską edukację `,
    textShort: `Co tu dużo mówić, w końcu żyjemy w Polsce.. Niemniej tutaj mamy dla was krótkie podsumownie aktualnych informacji dotyczących LexCzarnek i idiotyzmów polskiego obozu rządzącego. `,
    photo: `https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80`,
  },
];
const testDataSecondary = [
  {
    title: `Fotorelacja z wycieczki do babiogórskiego parku narodowego`,
    textShort: `W dobie pandemi Koronaświrusa, Adam Sarkowicz wypowiada mocne słowa: "Będziemy prowadzili zajęcia szkolne do ostatniego żywego ucznia." Udanych Igrzysk i niech los zawsze wam sprzyja!`,
    photo: `https://images.unsplash.com/photo-1494500764479-0c8f2919a3d8?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80`,
  },
  {
    title: `Teorie spiskowe odnośnie p. Dziedzica [ZOBACZ ZDJĘCIA]`,
    textShort: `W dobie pandemi Koronaświrusa, Adam Sarkowicz wypowiada mocne słowa: "Będziemy prowadzili zajęcia szkolne do ostatniego żywego ucznia." Udanych Igrzysk i niech los zawsze wam sprzyja!`,
    photo: `https://images.unsplash.com/photo-1470145318698-cb03732f5ddf?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80`,
  },
  {
    title: `Kalendarz maturalny 2022`,
    textShort: `W dobie pandemi Koronaświrusa, Adam Sarkowicz wypowiada mocne słowa: "Będziemy prowadzili zajęcia szkolne do ostatniego żywego ucznia." Udanych Igrzysk i niech los zawsze wam sprzyja!`,
    photo: `https://images.unsplash.com/photo-1506784365847-bbad939e9335?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1168&q=80`,
  },
  {
    title: `Nowe obostrzenia na terenie szkoły`,
    textShort: `W dobie pandemi Koronaświrusa, Adam Sarkowicz wypowiada mocne słowa: "Będziemy prowadzili zajęcia szkolne do ostatniego żywego ucznia." Udanych Igrzysk i niech los zawsze wam sprzyja!`,
    photo: `https://images.unsplash.com/photo-1584744982491-665216d95f8b?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80`,
  },
];
const testDataMain = [
  {
    title: `Adam Sarkowicz: "uczymy do ostatniego żywego ucznia" `,
    textShort: `W dobie pandemi Koronaświrusa, Adam Sarkowicz wypowiada mocne słowa: "Będziemy prowadzili zajęcia szkolne do ostatniego żywego ucznia." Udanych Igrzysk i niech los zawsze wam sprzyja!`,
    photo: `https://www.sportslaski.pl/static/thumbnail/article/med/13452.jpg`,
  },
  {
    title: `SpeedDating edycja 2022 - informacje`,
    textShort: `Nowa edycja SpeedDating'u już przednami, w tym poście znajdziecie wszystkie przydatne informacje dotyczące tegorocznej edycji wydarzenia.`,
    photo: `https://images.unsplash.com/photo-1544911845-1f34a3eb46b1?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80`,
  },
  {
    title: `PiS znowu atakuje polską edukację `,
    textShort: `Co tu dużo mówić, w końcu żyjemy w Polsce.. Niemniej tutaj mamy dla was krótkie podsumownie aktualnych informacji dotyczących LexCzarnek i idiotyzmów polskiego obozu rządzącego. `,
    photo: `https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80`,
  },
  {
    title: `Fotorelacja z wycieczki do babiogórskiego parku narodowego`,
    textShort: `W dobie pandemi Koronaświrusa, Adam Sarkowicz wypowiada mocne słowa: "Będziemy prowadzili zajęcia szkolne do ostatniego żywego ucznia." Udanych Igrzysk i niech los zawsze wam sprzyja!`,
    photo: `https://images.unsplash.com/photo-1494500764479-0c8f2919a3d8?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80`,
  },
  {
    title: `Teorie spiskowe odnośnie p. Dziedzica [ZOBACZ ZDJĘCIA]`,
    textShort: `W dobie pandemi Koronaświrusa, Adam Sarkowicz wypowiada mocne słowa: "Będziemy prowadzili zajęcia szkolne do ostatniego żywego ucznia." Udanych Igrzysk i niech los zawsze wam sprzyja!`,
    photo: `https://images.unsplash.com/photo-1470145318698-cb03732f5ddf?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80`,
  },
  {
    title: `Kalendarz maturalny 2022`,
    textShort: `W dobie pandemi Koronaświrusa, Adam Sarkowicz wypowiada mocne słowa: "Będziemy prowadzili zajęcia szkolne do ostatniego żywego ucznia." Udanych Igrzysk i niech los zawsze wam sprzyja!`,
    photo: `https://images.unsplash.com/photo-1506784365847-bbad939e9335?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1168&q=80`,
  },
  {
    title: `Nowe obostrzenia na terenie szkoły`,
    textShort: `W dobie pandemi Koronaświrusa, Adam Sarkowicz wypowiada mocne słowa: "Będziemy prowadzili zajęcia szkolne do ostatniego żywego ucznia." Udanych Igrzysk i niech los zawsze wam sprzyja!`,
    photo: `https://images.unsplash.com/photo-1584744982491-665216d95f8b?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80`,
  },
];

function createTestData(res) {
  let counter = 0;
  const startDate = new Date("2022-01-01");
  const now = new Date();

  for (const testDataCollection of [
    testDataPrimary,
    testDataSecondary,
    testDataMain,
  ]) {
    for (const testData of testDataCollection) {
      counter++;
      const randomDate = randomDateFromInterval(startDate, now);
      const data = {
        date: dateToTimestamp(randomDate),
        author: "Konrad Guzek",
        title: testData.title,
        text: testData.textShort,
        content: "Wydłużona treść postu.",
        photo: testData.photo,
      };
      const dummyRes = { status: () => ({ json: (data) => data }) };
      createSingleDocument(data, dummyRes, "news");
    }
  }
  res.status(200).json({ msg: `Success! Created ${counter} documents.` });
}

module.exports = {
  createTestData,
};
