const CARD_NUMBERS = 10
let currentPage = 1
let pokemons = []

const updatePaginationDiv = (currentPage, numPages) => {

  // maximum number of buttons to show
  const maxButtonsToShow = 5;

  // number of buttons to show on each side of the current page
  const halfButtonsToShow = Math.floor(maxButtonsToShow / 2);

  const startPage = Math.max(1, currentPage - halfButtonsToShow - 1);
  const endPage = Math.min(numPages, startPage + maxButtonsToShow - 1);

  $('#pagination').empty();

  // Add previous button if not on the first page
  if (currentPage > 1) {
    $('#pagination').append(`
      <button class="btn page ml-1 numberedButtons" id="paginate-button" value="${currentPage - 1}">Prev</button>
    `);
  }

  // Add numbered buttons
  for (let i = startPage; i <= endPage; i++) {
    $('#pagination').append(`
      <button class="btn page ml-1 numberedButtons${i === currentPage ? ' active' : ''}" id="paginate-button" value="${i}">${i}</button>
    `);
  }

  // Add next button if not on the last page
  if (currentPage < numPages) {
    $('#pagination').append(`
      <button class="btn page ml-1 numberedButtons" id="paginate-button" value="${currentPage + 1}">Next</button>
    `);
  }

  if (currentPage) {
    $(`#paginate-button[value="${currentPage}"]`).css('background', '#ffffff');
  }
}


const paginate = async (currentPage, CARD_NUMBERS, pokemons) => {

  const typeFilters = Array.from($('.typeFilter:checked')).map((checkbox) => checkbox.value);
  
  // filter pokemons by selected types
  let filteredPokemons = pokemons;
  if (typeFilters.length > 0) {
    filteredPokemons = await Promise.all(pokemons.map(async (pokemon) => {
      const res = await axios.get(pokemon.url);
      const types = res.data.types.map((type) => type.type.name);
      if (typeFilters.every((filter) => types.includes(filter))) {
        return pokemon;
      }
      return null;
    }));
    filteredPokemons = filteredPokemons.filter((pokemon) => pokemon !== null);
  }

  const selected_pokemons = pokemons.slice((currentPage - 1) * CARD_NUMBERS, currentPage * CARD_NUMBERS)
  $('#pokeCards').empty()
  selected_pokemons.forEach(async (pokemon) => {
    const res = await axios.get(pokemon.url)
    $('#pokeCards').append(`
      <div class="pokeCard card" pokeName=${res.data.name}>
        <h3>${res.data.name.toUpperCase()}</h3> 
        <img src="${res.data.sprites.front_default}" alt="${res.data.name}"/>
        <button type="button" class="btn" id="more-button" data-toggle="modal" data-target="#pokeModal">
          More
        </button>
        </div>
      `)
  })

  // total number of pokemons (810 pokemons)
  const numOfPokemon = pokemons.length

  // number of pokemons in the current page - number of pokemons in the previous pages
  numOfPokemonInpage = (currentPage - 1) * CARD_NUMBERS

  // if the current page is not the last page, the number of pokemons in the current page is the number of pokemons in the previous pages + 1
  if (numOfPokemonInpage < numOfPokemon) {
  numOfPokemonInpage = (currentPage - 1) * CARD_NUMBERS + 1

  // if the current page is not the last page, the number of pokemons in the current page is the number of pokemons in the previous pages + 1
  } else {
    numOfPokemonInpage = numOfPokemon
  }
  // total number of pokemons depends on the type of pokemons selected
  $('#numOfPokemon').html(`<p>You are watching ${numOfPokemonInpage} - ${numOfPokemonInpage + 9} pokemons out of total ${filteredPokemons.length} pokemons</p>`)
}

const setup = async () => {

  $('#pokeCards').empty()

  // fetch data from pokeapi
  let response = await axios.get('https://pokeapi.co/api/v2/pokemon?offset=0&limit=810');

  // make it into a JSON object
  pokemons = response.data.results;
  console.log("pokemons: ", pokemons);

  paginate(currentPage, CARD_NUMBERS, pokemons)

  // Finding the number of pages
  const numPages = Math.ceil(pokemons.length / CARD_NUMBERS)

  updatePaginationDiv(currentPage, numPages)

  // pop up modal when clicking on a pokemon card
  // add event listener to each pokemon card
  $('body').on('click', '.pokeCard', async function (e) {
    const pokemonName = $(this).attr('pokeName')
    // console.log("pokemonName: ", pokemonName);
    const res = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`)
    // console.log("res.data: ", res.data);
    const types = res.data.types.map((type) => type.type.name)
    // console.log("types: ", types);

    // putting information that are fetched from JSON object into card body
    $('.modal-body').html(`
        <div style="width:200px">
        <img src="${res.data.sprites.other['official-artwork'].front_default}" alt="${res.data.name}"/>
        <div>
        <h3>Abilities</h3>
        <ul>
        ${res.data.abilities.map((ability) => `<li>${ability.ability.name}</li>`).join('')}
        </ul>
        </div>

        <div>
        <h3>Stats</h3>
        <ul>
        ${res.data.stats.map((stat) => `<li>${stat.stat.name}: ${stat.base_stat}</li>`).join('')}
        </ul>

        </div>

        </div>
          <h3>Types</h3>
          <ul>
          ${types.map((type) => `<li>${type}</li>`).join('')}
          </ul>
      
        `)
    $('.modal-title').html(`
        <h2>${res.data.name.toUpperCase()}</h2>
        <h5>${res.data.id}</h5>
        `)
  })

  // add event listener to paginate-buttons
  $('body').on('click', ".numberedButtons", async function (e) {
    currentPage = Number(e.target.value)
    paginate(currentPage, CARD_NUMBERS, pokemons)

    //update paginate-buttons
    updatePaginationDiv(currentPage, numPages)
  })

    // Pokemon type API
    const typeAPI = await axios.get('https://pokeapi.co/api/v2/type');
    const types = typeAPI.data.results;
  
    // Create checkboxes for each type
    types.forEach((type) => {
      $('#typeFilters').append(`
        <div class="form-check form-check-inline">
          <input class="form-check-input typeFilter" type="checkbox" value="${type.name}" id="${type.name}">
          <label class="form-check-label" for="${type.name}">
            ${type.name}
          </label>
        </div>
      `);
    });
  
    $('body').on('change', '.typeFilter', async function (e) {
      currentPage = 1;
      paginate(currentPage, CARD_NUMBERS, pokemons);
  
      // update pagination buttons
      const numPages = Math.ceil(pokemons.length / CARD_NUMBERS);
      updatePaginationDiv(currentPage, numPages);
    });
}


$(document).ready(setup)