"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

const EMPTY_STAR = "bi bi-star";
const FILLED_STAR = "bi bi-star-fill";
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
  const isFavorite = checkIfFavorite(story.storyId); //return true or false
  let iconClass = isFavorite ? FILLED_STAR : EMPTY_STAR;

  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">
        <span class="star">
          <i class="${iconClass}"></i>
        </span>
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

/** TO DO:
 * "ON CLICK" -> star icon
 * 1. toggles icon from blank star to filled star in the DOM (seperate fx)
 * 2. check if parent li for storyID (2-5 is another fx)
 * 3. check if storyID is in currentUser.favorites
 * 4. if yes -> call unfavorite fx
 * 5. if no -> call addfavorite fx
 */
function toggleIcon(star) {
  //if star i class = bi bi-star -> toggle to bi bi-star-fill
  const $icon = star.children("i");

  $icon.toggleClass(`${EMPTY_STAR} ${FILLED_STAR}`);
}

//toggle storyFavorites
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

function checkIfFavorite(storyId) {
  const isFavorite = currentUser.favorites.map((s) => s.storyId).includes(storyId)
  return isFavorite;
}

//global on click fxfunction toggleStoryFavorite
$allStoriesList.on("click", function (evt) {
  const targetStory = $(evt.target).closest(".star");
  toggleIcon(targetStory);
  toggleStoryFavorite(targetStory);
});
