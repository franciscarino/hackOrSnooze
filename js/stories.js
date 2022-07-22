"use strict";


//TODO: add a hover fx on delete icon so more responsive
//TODO: add a click to call deleteStory function

// This is the global list of the stories, an instance of StoryList
let storyList;

// class attribute names for icons
const EMPTY_STAR = "bi bi-star";
const FILLED_STAR = "bi bi-star-fill";

const EMPTY_TRASH = "bi bi-trash";
const FILLED_TRASH = "bi bi-trash-fill";

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);
  const hostName = story.getHostName();

  return $(`
      <li id="${story.storyId}">
        <span class="star">${generateIconHtmlMarkup(story)}</span>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

/** Get user input from form and get form input values,
 * then put stories on page */

async function submitNewStory() {
  const author = $("#create-author").val();
  const title = $("#create-title").val();
  const url = $("#create-url").val();

  const newStorySubmission = await storyList.addStory(currentUser, {
    title,
    author,
    url,
  });

  const $newStory = generateStoryMarkup(newStorySubmission);
  $allStoriesList.prepend($newStory);
  $allStoriesList.show();

  $submitForm.hide();
}

/** Listen for click on submit form */

$submitForm.on("click", "#submit-story", submitNewStory);

/**Create Icon Html element with the correct icon
 * depending on if story is a user favorite or not*/

function generateIconHtmlMarkup(story) {
  const isFavorite = checkIfFavorite(story.storyId); //return true or false
  let iconClass = isFavorite ? FILLED_STAR : EMPTY_STAR;

  return `<i class="${iconClass}"></i>`;
}

/** Toggles between filled and unfilled star icon for favorites */

function toggleIcon(star) {
  const $icon = star.children("i");

  $icon.toggleClass(`${EMPTY_STAR} ${FILLED_STAR}`);
}

/** Adds a delete icon in front of user stories */

function generateDeleteIcon() {
  $(".star").prepend(`<span class="trash-can">
  <i class="${EMPTY_TRASH}"></i>
  </span>`)
}

/** toggle storyFavorites */

async function toggleStoryFavorite(favoriteStory) {
  const $story = favoriteStory.parent("li");
  const storyId = $story.attr("id");

  const selectedStory = await Story.getStorybyStoryId(storyId);

  if (checkIfFavorite(storyId)) {
    await currentUser.unFavorite(selectedStory.data.story);
  } else {
    await currentUser.addFavorite(selectedStory.data.story);
  }
}

/** Check if a story is already a user favorite
 * returns (boolean) true or false
 */

function checkIfFavorite(storyId) {
  const isFavorite = currentUser.favorites
    .map((s) => s.storyId)
    .includes(storyId);
  return isFavorite;
}

/** Listen for click on star and calls toggle icon function
 * and adds/removes favorite
 */

$body.on("click", ".star", function (evt) {
  const targetStory = $(evt.target).closest(".star");
  toggleIcon(targetStory);
  toggleStoryFavorite(targetStory);
});

/**Given favorites array, use generateStoryMarkup to populate and append favorites to favorites class */

function putFavoritesListOnPage() {
  $allStoriesList.hide();
  $userStoriesList.hide();
  $favoritedStoriesList.empty();

  if (currentUser.favorites.length === 0) {
    $favoritedStoriesList.append(
      "<h5>No favorites added by user yet!</h5>"
    )

    $favoritedStoriesList.show();

    return;
  }

  for (let story of currentUser.favorites) {
    const $story = generateStoryMarkup(story);

    $favoritedStoriesList.append($story);

    $favoritedStoriesList.show();
  }
}

/** Given array of user own stories, display user stories on page */

function putUserStoriesOnPage() {
  $allStoriesList.hide();
  $favoritedStoriesList.hide();
  $userStoriesList.empty();

  if (currentUser.ownStories.length === 0) {
    $userStoriesList.append(
      "<h5>No stories added by user yet!</h5>"
    )

    $userStoriesList.show();

    return;
  }

  for (let story of currentUser.ownStories) {
    const $story = generateStoryMarkup(story);

    $userStoriesList.append($story);
  }
  generateDeleteIcon();

  $userStoriesList.show();
}
