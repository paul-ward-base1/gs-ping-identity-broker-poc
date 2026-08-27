import { ActivityHit, ActivityQuery, ActivitySearchResult } from '@/lib/search/api/activity';
import { SearchEngine } from './searchEngine';
import { BadgeHit, BadgeQuery, BadgeSearchResult } from '@/lib/search/api/badge';
import { AwardHit } from '@/lib/search/api/award';

const allActivities: ActivityHit[] = [
  {
    path: '/content/dam/gsusa-vtk-redesign/en/activities/badge/a-f/find-out-how-to-be-responsible-when-taking-a-pet-outdoors/find-out-how-to-be-responsible-when-taking-a-pet-outdoors',
    name: 'Find out how to be responsible when taking a pet outdoors',
    imagePath:
      '/content/dam/gsusa-vtk-redesign/common/media/images/placeholders/Plants Animals and the Environment_Activity Icon.png',
    timeRange: '20–30 minutes ',
    badgeFamilies: ['Animals'],
    programLevels: ['Brownie'],
    themes: ['Plants, Animals, and the Environment'],
  },
  {
    path: '/content/dam/gsusa-vtk-redesign/en/activities/badge/m-r/make-a-first-aid-kit-for-your-home/make-a-first-aid-kit-for-your-home',
    name: 'Make a first aid kit for your home',
    imagePath: '/content/dam/gsusa-vtk-redesign/common/media/images/placeholders/Balanced Living_Activity Icon.png',
    timeRange: '20–30 minutes',
    badgeFamilies: ['First Aid'],
    programLevels: ['Brownie'],
    themes: ['Balanced Living'],
  },
  {
    path: '/content/dam/gsusa-vtk-redesign/en/activities/badge/m-r/make-up-a-game-to-play-with-a-pet/make-up-a-game-to-play-with-a-pet',
    name: 'Make up a game to play with a pet',
    imagePath:
      '/content/dam/gsusa-vtk-redesign/common/media/images/placeholders/Plants Animals and the Environment_Activity Icon.png',
    timeRange: '20–30 minutes ',
    badgeFamilies: ['Animals'],
    programLevels: ['Brownie'],
    themes: ['Plants, Animals, and the Environment'],
  },
  {
    path: '/content/dam/gsusa-vtk-redesign/en/activities/badge/m-r/role-play-911/role-play-911',
    name: 'Role-play 911',
    imagePath: '/content/dam/gsusa-vtk-redesign/common/media/images/placeholders/Balanced Living_Activity Icon.png',
    timeRange: '30–40 minutes',
    badgeFamilies: ['First Aid'],
    programLevels: ['Brownie'],
    themes: ['Balanced Living'],
  },
  {
    path: '/content/dam/gsusa-vtk-redesign/en/activities/badge/s-z/visit-a-food-bank-or-animal-shelter/visit-a-food-bank-or-animal-shelter',
    name: 'Visit a food bank or animal shelter',
    imagePath: '/content/dam/gsusa-vtk-redesign/common/media/images/activity-images/12.png',
    timeRange: '20-30 minutes',
    badgeFamilies: ['Financial Empowerment'],
    programLevels: ['Brownie'],
    themes: ['Entrepreneurship and Money'],
  },
  {
    path: '/content/dam/gsusa-vtk-redesign/en/activities/badge/m-r/play-bingo-at-a-pet-store/play-bingo-at-a-pet-store',
    name: 'Play bingo at a pet supply store',
    imagePath:
      '/content/dam/gsusa-vtk-redesign/common/media/images/placeholders/Plants Animals and the Environment_Activity Icon.png',
    timeRange: '30–40 minutes ',
    badgeFamilies: ['Animals'],
    programLevels: ['Brownie'],
    themes: ['Plants, Animals, and the Environment'],
  },
  {
    path: '/content/dam/gsusa-vtk-redesign/en/activities/badge/m-r/play-bingo-at-a-veterinarians-office/play-bingo-at-a-veterinarians-office',
    name: 'Play bingo at a veterinarian’s office',
    imagePath:
      '/content/dam/gsusa-vtk-redesign/common/media/images/placeholders/Plants Animals and the Environment_Activity Icon.png',
    timeRange: '30–40 minutes ',
    badgeFamilies: ['Animals'],
    programLevels: ['Brownie'],
    themes: ['Plants, Animals, and the Environment'],
  },
  {
    path: '/content/dam/gsusa-vtk-redesign/en/activities/badge/s-z/set-a-troop-goal/set-a-troop-goal',
    name: 'Set a troop goal',
    imagePath: '/content/dam/gsusa-vtk-redesign/common/media/images/activity-images/4.png',
    timeRange: '30-40 minutes',
    badgeFamilies: ['Financial Empowerment'],
    programLevels: ['Brownie'],
    themes: ['Entrepreneurship and Money'],
  },
  {
    path: '/content/dam/gsusa-vtk-redesign/en/activities/badge/a-f/create-a-poster/create-a-poster',
    name: 'Create a poster',
    imagePath: '/content/dam/gsusa-vtk-redesign/common/media/images/activity-images/7.png',
    timeRange: '20-30 minutes',
    badgeFamilies: ['Financial Empowerment'],
    programLevels: ['Brownie'],
    themes: ['Entrepreneurship and Money'],
  },
  {
    path: '/content/dam/gsusa-vtk-redesign/en/activities/badge/g-l/get-tips-from-a-doctor-or-nurse/get-tips-from-a-doctor-or-nurse',
    name: 'Get tips from a doctor or nurse',
    imagePath: '/content/dam/gsusa-vtk-redesign/common/media/images/placeholders/Balanced Living_Activity Icon.png',
    timeRange: '20–30 minutes',
    badgeFamilies: ['First Aid'],
    programLevels: ['Brownie'],
    themes: ['Balanced Living'],
  },
  {
    path: '/content/dam/gsusa-vtk-redesign/en/activities/badge/m-r/practice-911-with-a-friend-or-family-member/practice-911-with-a-friend-or-family-member',
    name: 'Practice 911 with a friend or family member',
    imagePath: '/content/dam/gsusa-vtk-redesign/common/media/images/placeholders/Balanced Living_Activity Icon.png',
    timeRange: '30–40 minutes',
    badgeFamilies: ['First Aid'],
    programLevels: ['Brownie'],
    themes: ['Balanced Living'],
  },
  {
    path: '/content/dam/gsusa-vtk-redesign/en/activities/badge/s-z/take-a-hike/take-a-hike',
    name: 'Take a hike',
    imagePath: '/content/dam/gsusa-vtk-redesign/common/media/images/placeholders/Balanced Living_Activity Icon.png',
    timeRange: '20–30 minutes',
    badgeFamilies: ['First Aid'],
    programLevels: ['Brownie'],
    themes: ['Balanced Living'],
  },
  {
    path: '/content/dam/gsusa-vtk-redesign/en/activities/badge/g-l/learn-how-three-different-kinds-of-pets-communicate-their-feelings/learn-how-three-different-kinds-of-pets-communicate-their-feelings',
    name: 'Learn how three different kinds of pets communicate their feelings',
    imagePath:
      '/content/dam/gsusa-vtk-redesign/common/media/images/placeholders/Plants Animals and the Environment_Activity Icon.png',
    timeRange: '20–30 minutes ',
    badgeFamilies: ['Animals'],
    programLevels: ['Brownie'],
    themes: ['Plants, Animals, and the Environment'],
  },
  {
    path: '/content/dam/gsusa-vtk-redesign/en/activities/badge/m-r/make-a-first-aid-kit-for-your-girl-scout-meeting-place/make-a-first-aid-kit-for-your-girl-scout-meeting-place',
    name: 'Make a first aid kit for your Girl Scout meeting place',
    imagePath: '/content/dam/gsusa-vtk-redesign/common/media/images/placeholders/Balanced Living_Activity Icon.png',
    timeRange: '20–30 minutes',
    badgeFamilies: ['First Aid'],
    programLevels: ['Brownie'],
    themes: ['Balanced Living'],
  },
  {
    path: '/content/dam/gsusa-vtk-redesign/en/activities/badge/s-z/talk-to-an-emergency-medical-technician-emt/talk-to-an-emergency-medical-technician-emt',
    name: 'Talk to an emergency medical technician (EMT)',
    imagePath: '/content/dam/gsusa-vtk-redesign/common/media/images/placeholders/Balanced Living_Activity Icon.png',
    timeRange: '30–40 minutes',
    badgeFamilies: ['First Aid'],
    programLevels: ['Brownie'],
    themes: ['Balanced Living'],
  },
  {
    path: '/content/dam/gsusa-vtk-redesign/en/activities/badge/s-z/talk-to-an-outdoor-expert/talk-to-an-outdoor-expert',
    name: 'Talk to an outdoor expert',
    imagePath: '/content/dam/gsusa-vtk-redesign/common/media/images/placeholders/Balanced Living_Activity Icon.png',
    timeRange: '20–30 minutes',
    badgeFamilies: ['First Aid'],
    programLevels: ['Brownie'],
    themes: ['Balanced Living'],
  },
  {
    path: '/content/dam/gsusa-vtk-redesign/en/activities/badge/s-z/visit-a-fire-station/visit-a-fire-station',
    name: 'Visit a fire station',
    imagePath: '/content/dam/gsusa-vtk-redesign/common/media/images/placeholders/Balanced Living_Activity Icon.png',
    timeRange: '30–40 minutes',
    badgeFamilies: ['First Aid'],
    programLevels: ['Brownie'],
    themes: ['Balanced Living'],
  },
  {
    path: '/content/dam/gsusa-vtk-redesign/en/activities/badge/g-l/learn-about-first-aid/learn-about-first-aid',
    name: 'Learn about first aid',
    imagePath: '/content/dam/gsusa-vtk-redesign/common/media/images/placeholders/Balanced Living_Activity Icon.png',
    timeRange: '20–30 minutes',
    badgeFamilies: ['First Aid'],
    programLevels: ['Brownie'],
    themes: ['Balanced Living'],
  },
  {
    path: '/content/dam/gsusa-vtk-redesign/en/activities/badge/m-r/make-a-feeding-schedule/make-a-feeding-schedule',
    name: 'If you have a pet of your own, make a feeding schedule',
    imagePath:
      '/content/dam/gsusa-vtk-redesign/common/media/images/placeholders/Plants Animals and the Environment_Activity Icon.png',
    timeRange: '20-30 minutes',
    badgeFamilies: ['Animals'],
    programLevels: ['Brownie'],
    themes: ['Plants, Animals, and the Environment'],
  },
  {
    path: '/content/dam/gsusa-vtk-redesign/en/activities/badge/a-f/ask-a-veterinarian-about-health-issues-for-three-pets/ask-a-veterinarian-about-health-issues-for-three-pets',
    name: 'Ask a veterinarian about health issues for three pets',
    imagePath:
      '/content/dam/gsusa-vtk-redesign/common/media/images/placeholders/Plants Animals and the Environment_Activity Icon.png',
    timeRange: '15-20 minutes',
    badgeFamilies: ['Animals'],
    programLevels: ['Brownie'],
    themes: ['Plants, Animals, and the Environment'],
  },
  {
    path: '/content/dam/gsusa-vtk-redesign/en/activities/badge/a-f/act-out-a-day-of-fun-with-your-troop/act-out-a-day-of-fun-with-your-troop',
    name: 'Act out a day of fun with your troop',
    imagePath: '/content/dam/gsusa-vtk-redesign/common/media/images/placeholders/Leadership and Your Future.png',
    timeRange: '15–20 minutes',
    badgeFamilies: ['Financial Empowerment'],
    programLevels: ['Daisy'],
    themes: ['Entrepreneurship and Money'],
  },
  {
    path: '/content/dam/gsusa-vtk-redesign/en/activities/badge/a-f/be-a-climate-change-champion/be-a-climate-change-champion',
    name: 'Be a climate change champion',
    imagePath: '/content/dam/gsusa-redesign/bg1.jpg',
    timeRange: '15-20 minutes',
    badgeFamilies: ['Petals'],
    programLevels: ['Daisy'],
    themes: ['Your World Near and Far'],
  },
  {
    path: '/content/dam/gsusa-vtk-redesign/en/activities/badge/a-f/be-the-cage-or-tank-cleaner/be-the-cage-or-tank-cleaner',
    name: 'Be the cage or tank cleaner',
    imagePath:
      '/content/dam/gsusa-vtk-redesign/common/media/images/placeholders/Plants Animals and the Environment_Activity Icon.png',
    timeRange: '30–40 minutes',
    badgeFamilies: ['Animals'],
    programLevels: ['Brownie'],
    themes: ['Plants, Animals, and the Environment'],
  },
  {
    path: '/content/dam/gsusa-vtk-redesign/en/activities/badge/a-f/budget-for-the-future/budget-for-the-future',
    name: 'Budget for the future',
    imagePath: '/content/dam/gsusa-vtk-redesign/common/media/images/activity-images/9.png',
    timeRange: '20-30 minutes',
    badgeFamilies: ['Financial Empowerment'],
    programLevels: ['Brownie'],
    themes: ['Entrepreneurship and Money'],
  },
  {
    path: '/content/dam/gsusa-vtk-redesign/en/activities/badge/a-f/choose-how-to-help-others-yo/choose-how-to-help-others-yo',
    name: 'Choose how to help others',
    imagePath: '/content/dam/gsusa-vtk-redesign/common/media/images/activity-images/5.png',
    timeRange: '15–20 minutes',
    badgeFamilies: ['Financial Empowerment'],
    programLevels: ['Daisy'],
    themes: ['Entrepreneurship and Money'],
  },
  {
    path: '/content/dam/gsusa-vtk-redesign/en/activities/badge/a-f/come-up-with-a-troop-goal/come-up-with-a-troop-goal',
    name: 'Come up with a troop goal',
    imagePath: '/content/dam/gsusa-vtk-redesign/common/media/images/activity-images/7.png',
    timeRange: '15–20 minutes',
    badgeFamilies: ['Financial Empowerment'],
    programLevels: ['Daisy'],
    themes: ['Entrepreneurship and Money'],
  },
  {
    path: '/content/dam/gsusa-vtk-redesign/en/activities/badge/a-f/create-a-backyard-shelter/create-a-backyard-shelter',
    name: 'Create a backyard shelter',
    imagePath: '/content/dam/gsusa-vtk-redesign/common/media/images/activity-images/12.png',
    timeRange: '20-30 minutes',
    badgeFamilies: ['Animals'],
    programLevels: ['Junior'],
    themes: ['Plants, Animals, and the Environment'],
  },
  {
    path: '/content/dam/gsusa-vtk-redesign/en/activities/badge/a-f/create-a-show-about-wild-animals/create-a-show-about-wild-animals',
    name: 'Create a show about wild animals',
    imagePath: '/content/dam/gsusa-vtk-redesign/common/media/images/activity-images/11.png',
    timeRange: '30 - 40 minutes',
    badgeFamilies: ['Animals'],
    programLevels: ['Junior', 'Daisy', 'Brownie', 'Cadette', 'Senior', 'Ambassador'],
    themes: ['Plants, Animals, and the Environment'],
  },
  {
    path: '/content/dam/gsusa-vtk-redesign/en/activities/badge/a-f/create-a-story-about-a-baby-animal-home/create-a-story-about-a-baby-animal-home',
    name: 'Create a story about a baby animal home',
    imagePath: '/content/dam/gsusa-vtk-redesign/common/media/images/placeholders/Balanced Living_Activity Icon.png',
    timeRange: '20-30 minutes',
    badgeFamilies: ['Animals'],
    programLevels: ['Junior'],
    themes: ['Plants, Animals, and the Environment'],
  },
  {
    path: '/content/dam/gsusa-vtk-redesign/en/activities/badge/a-f/create-a-wish-list-board/create-a-wish-list-board',
    name: 'Create a wish list board',
    imagePath: '/content/dam/gsusa-vtk-redesign/common/media/images/activity-images/10.png',
    timeRange: '20-30 minutes',
    badgeFamilies: ['Financial Empowerment'],
    programLevels: ['Brownie'],
    themes: ['Entrepreneurship and Money'],
  },
];

/**
 * Master list of mock badges. Mirrors the dev environment so pagination
 * (page > 1) is exercisable locally with SEARCH_TYPE=mock. The findBadges
 * implementation below slices this list based on the query's page/limit.
 */
const allBadges: BadgeHit[] = [
  {
    path: '/content/dam/gsusa-vtk-redesign/en/badges/ambassador/stem-career-exploration/stem-career-exploration',
    name: 'Ambassador STEM Career Exploration',
    imagePath:
      '/content/dam/gsusa-vtk-redesign/common/media/images/badge-images/AmbassadorSTEMCareerExploration_Badge.png',
    programLevel: 'Ambassador',
    theme: 'Leadership and Your Future',
  },
  {
    path: '/content/dam/gsusa-vtk-redesign/en/badges/junior/animal-habitats/animal-habitats',
    name: 'Animal Habitats',
    imagePath: '/content/dam/gsusa-vtk-redesign/common/media/images/badge-images/Junior_AnimalHabitats_Badge.png',
    family: 'Animals',
    programLevel: 'Junior',
    theme: 'Plants, Animals, and the Environment',
  },
  {
    path: '/content/dam/gsusa-vtk-redesign/en/badges/daisy/animal-observer/animal-observer',
    name: 'Animal Observer',
    imagePath: '/content/dam/gsusa-vtk-redesign/en/badges/daisy/animal-observer/media/AnimalObserver.png',
    family: 'Animals',
    programLevel: 'Daisy',
    theme: 'Plants, Animals, and the Environment',
  },
  {
    path: '/content/dam/gsusa-vtk-redesign/en/badges/junior/automotive/automotive-moved',
    name: 'Automotive',
    imagePath:
      '/content/dam/gsusa-vtk-redesign/common/media/images/badge-images/20_GE_JuniorAutomotiveDesign_Badge_600x600px.png',
    family: 'Automotive Engineering',
    programLevel: 'Junior',
    theme: 'Technology and Innovation',
  },
  {
    path: '/content/dam/gsusa-vtk-redesign/en/badges/brownie/first-aid/first-aid',
    name: 'Brownie First Aid',
    imagePath: '/content/dam/gsusa-vtk-redesign/common/media/images/badge-images/Brownie_FirstAid_Badge.png',
    family: 'First Aid',
    programLevel: 'Brownie',
    theme: 'Balanced Living',
  },
  {
    path: '/content/dam/gsusa-vtk-redesign/en/badges/brownie/brownie-stem-career-exploration/brownie-stem-career-exploration',
    name: 'Brownie STEM Career Exploration',
    imagePath:
      '/content/dam/gsusa-vtk-redesign/common/media/images/badge-images/20_GE_BrownieSTEMCareerExploration_Badge.png',
    family: 'Financial Empowerment',
    programLevel: 'Brownie',
    theme: 'Leadership and Your Future',
  },
  {
    path: '/content/dam/gsusa-vtk-redesign/en/badges/cadette/first-aid/first-aid',
    name: 'Cadette First Aid',
    imagePath: '/content/dam/gsusa-vtk-redesign/common/media/images/badge-images/Cadette_FirstAidBadge.png',
    family: 'First Aid',
    programLevel: 'Cadette',
    theme: 'Balanced Living',
  },
  {
    path: '/content/dam/gsusa-vtk-redesign/en/badges/daisy/animal-observer1/dinosaur-hunter',
    name: 'Dinosaur Hunter',
    imagePath:
      '/content/dam/gsusa-vtk-redesign/common/media/images/badge-images/19_GE_DaisyDigitalGameDesign_badge.png',
    family: 'Animals',
    programLevel: 'Daisy',
    theme: 'Plants, Animals, and the Environment',
  },
  {
    path: '/content/dam/gsusa-vtk-redesign/en/badges/junior/cookie-entrepreneur-family-pin/cookie-entrepreneur-family-pin',
    name: 'Junior Cookie Entrepreneur Family Pin',
    imagePath: '/content/dam/gsusa-vtk-redesign/common/media/images/badge-images/Junior_CookieEntreprenuershipPin.png',
    family: 'Financial Empowerment',
    programLevel: 'Junior',
    theme: 'Entrepreneurship and Money',
  },
  {
    path: '/content/dam/gsusa-vtk-redesign/en/badges/junior/first-aid/first-aid',
    name: 'Junior First Aid',
    imagePath: '/content/dam/gsusa-vtk-redesign/common/media/images/badge-images/Junior_FirstAid_Badge.png',
    family: 'First Aid',
    programLevel: 'Junior',
    theme: 'Balanced Living',
  },
  {
    path: '/content/dam/gsusa-vtk-redesign/en/badges/daisy/make-the-world-a-better-place/make-the-world-a-better-place',
    name: 'Make the World a Better Place',
    imagePath:
      '/content/dam/gsusa-vtk-redesign/common/media/images/badge-images/Daisy_MakeTheWorldBetterPlacePetal_Badge.png',
    family: 'Petals',
    programLevel: 'Daisy',
    theme: 'Your World Near and Far',
  },
  {
    path: '/content/dam/gsusa-vtk-redesign/en/badges/daisy/my-money-choices/my-money-choices',
    name: 'My Money Choices',
    imagePath: '/content/dam/gsusa-vtk-redesign/common/media/images/badge-images/Daisy_MyMoneyChoices_Badge.png',
    family: 'Financial Empowerment',
    programLevel: 'Daisy',
    theme: 'Entrepreneurship and Money',
  },
  {
    path: '/content/dam/gsusa-vtk-redesign/en/badges/junior/my-money-plan/my-money-plan',
    name: 'My Money Plan',
    imagePath: '/content/dam/gsusa-vtk-redesign/common/media/images/badge-images/Junior_MyMoneyPlan_Badge.png',
    family: 'Financial Empowerment',
    programLevel: 'Junior',
    theme: 'Entrepreneurship and Money',
  },
  {
    path: '/content/dam/gsusa-vtk-redesign/en/badges/brownie/my-own-budget/my-own-budget',
    name: 'My Own Budget',
    imagePath: '/content/dam/gsusa-vtk-redesign/common/media/images/badge-images/Brownie_MyOwnBudget_Badge.png',
    family: 'Financial Empowerment',
    programLevel: 'Brownie',
    theme: 'Entrepreneurship and Money',
  },
  {
    path: '/content/dam/gsusa-vtk-redesign/en/badges/brownie/pets/pets',
    name: 'Pets',
    imagePath: '/content/dam/gsusa-vtk-redesign/common/media/images/badge-images/Brownie_Pets_Badge.png',
    family: 'Animals',
    programLevel: 'Brownie',
    theme: 'Plants, Animals, and the Environment',
  },
  {
    path: '/content/dam/gsusa-vtk-redesign/en/badges/senior/senior-cookie-entrepreneur-family-pin/senior-cookie-entrepreneur-family-pin',
    name: 'Senior Cookie Entrepreneur Family Pin',
    imagePath: '/content/dam/gsusa-vtk-redesign/common/media/images/badge-images/Senior Cookie Pins_2.png',
    family: 'Financial Empowerment',
    programLevel: 'Senior',
    theme: 'Entrepreneurship and Money',
  },
  {
    path: '/content/dam/gsusa-vtk-redesign/en/badges/senior/senior-first-aid/senior-first-aid',
    name: 'Senior First Aid',
    imagePath: '/content/dam/gsusa-vtk-redesign/common/media/images/badge-images/Senior_FirstAid.png',
    family: 'First Aid',
    programLevel: 'Senior',
    theme: 'Balanced Living',
  },
  {
    path: '/content/dam/gsusa-vtk-redesign/en/badges/senior/tc-no-activities-only-closing-question/tc-no-activities-only-closing-question',
    name: 'TC No activities only closing question',
    imagePath: '/content/dam/gsusa-vtk-redesign/common/media/images/badge-images/Senior_FirstAid.png',
    family: 'Financial Empowerment',
    programLevel: 'Senior',
    theme: 'Technology and Innovation',
  },
  {
    path: '/content/dam/gsusa-vtk-redesign/en/badges/junior/tc02-maximal-all-optional-fields/tc02-maximal-all-optional-fields',
    name: 'TC02 Maximal All Optional Fields',
    imagePath: '/content/dam/gsusa-vtk-redesign/common/media/images/badge-images/Senior_FirstAid.png',
    family: 'Automotive Engineering',
    programLevel: 'Junior',
    theme: 'Technology and Innovation',
  },
  {
    path: '/content/dam/gsusa-vtk-redesign/en/badges/junior/tc04-tag-only/tc04-tag-only',
    name: 'TC04 Tag Only',
    imagePath: '/content/dam/gsusa-vtk-redesign/common/media/images/badge-images/Senior_FirstAid.png',
    programLevel: 'Junior',
  },
  {
    path: '/content/dam/gsusa-vtk-redesign/en/badges/junior/tc05-buy-button-alone/tc05-buy-button-alone',
    name: 'TC05 Buy Button Alone',
    imagePath: '/content/dam/gsusa-vtk-redesign/common/media/images/badge-images/Senior_FirstAid.png',
    programLevel: 'Junior',
  },
  {
    path: '/content/dam/gsusa-vtk-redesign/en/badges/junior/tc06-closing-q-and-handouts/tc06-closing-q-and-handouts',
    name: 'TC06 Closing Q And Handouts Add Handouts Manually',
    imagePath: '/content/dam/gsusa-vtk-redesign/common/media/images/badge-images/Senior_FirstAid.png',
    programLevel: 'Junior',
  },
  {
    path: '/content/dam/gsusa-vtk-redesign/en/badges/junior/tc09-steps-one-with-activity/tc09-steps-one-with-activity',
    name: 'TC09 Steps One With Activity Add Step And Activity Manually',
    imagePath: '/content/dam/gsusa-vtk-redesign/common/media/images/badge-images/Senior_FirstAid.png',
    programLevel: 'Junior',
  },
  {
    path: '/content/dam/gsusa-vtk-redesign/en/badges/junior/tc10-steps-many-all-with-activity/tc10-steps-many-all-with-activity',
    name: 'TC10 Steps Many All With Activity Add Steps Manually',
    imagePath: '/content/dam/gsusa-vtk-redesign/common/media/images/badge-images/Senior_FirstAid.png',
    programLevel: 'Junior',
  },
  {
    path: '/content/dam/gsusa-vtk-redesign/en/badges/junior/tc11-steps-many-mixed/tc11-steps-many-mixed',
    name: 'TC11 Steps Many Mixed With And Without Activity Add Steps Manually',
    imagePath: '/content/dam/gsusa-vtk-redesign/common/media/images/badge-images/Senior_FirstAid.png',
    programLevel: 'Junior',
  },
  {
    path: '/content/dam/gsusa-vtk-redesign/en/badges/junior/tc12-buy-plus-steps-with-activities/tc12-buy-plus-steps-with-activities',
    name: 'TC12 Buy Plus Steps With Activities Add Steps Manually',
    imagePath: '/content/dam/gsusa-vtk-redesign/common/media/images/badge-images/Senior_FirstAid.png',
    programLevel: 'Junior',
  },
  {
    path: '/content/dam/gsusa-vtk-redesign/en/badges/junior/tc13-program-level-plus-tag/tc13-program-level-plus-tag',
    name: 'TC13 Program Level Plus Tag',
    imagePath: '/content/dam/gsusa-vtk-redesign/common/media/images/badge-images/Senior_FirstAid.png',
    programLevel: 'Junior',
  },
  {
    path: '/content/dam/gsusa-vtk-redesign/en/badges/ambassador/this-is-the-name-field/this-is-the-name-field',
    name: 'this is the title field in csv',
    imagePath: '/content/dam/gsusa-vtk-redesign/common/media/images/badge-images/CookieInfluencer_Badge.png',
    programLevel: 'Ambassador',
  },
];

const allAwards: AwardHit[] = [
  {
    path: '/content/dam/gsusa-vtk-redesign/en/awards/junior/true-north-award/junior-true-north-award',
    name: 'Junior True North Award',
    imagePath: '/content/dam/gsusa-vtk-redesign/common/media/images/badge-images/Junior_TrueNorth_Award.png',
    family: 'True North Award',
    programLevels: ['Junior'],
    theme: 'Balanced Living',
  },
  {
    path: '/content/dam/gsusa-vtk-redesign/en/awards/cadette/true-north-award/true-north-award',
    name: 'Cadette True North Award',
    imagePath: '/content/dam/gsusa-vtk-redesign/common/media/images/badge-images/Cadette_TrueNorthAward.png',
    family: 'True North Award',
    programLevels: ['Cadette'],
    theme: 'Balanced Living',
  },
  {
    path: '/content/dam/gsusa-vtk-redesign/en/awards/junior/bronze-award/bronze-award',
    name: 'Bronze Award',
    imagePath: '/content/dam/gsusa-vtk-redesign/common/media/images/badge-images/Junir_BronzeAward.jpg',
    family: 'High Award',
    programLevels: ['Junior'],
    theme: 'Leadership and Your Future',
  },
  {
    path: '/content/dam/gsusa-vtk-redesign/en/awards/cadette/silver-award/silver-award',
    name: 'Silver Award',
    imagePath: '/content/dam/gsusa-vtk-redesign/common/media/images/badge-images/Cadette_SilverAward.jpg',
    family: 'High Award',
    programLevels: ['Cadette'],
    theme: 'Leadership and Your Future',
  },
  {
    path: '/content/dam/gsusa-vtk-redesign/en/awards/senior/senior-true-north/senior-ambassador-true-north-award',
    name: 'Senior Ambassador True North Award',
    imagePath: '/content/dam/gsusa-vtk-redesign/common/media/images/badge-images/Senior_Ambassador_TrueNorthAward.png',
    family: 'True North Award',
    programLevels: ['Senior', 'Ambassador'],
  },
  {
    path: '/content/dam/gsusa-vtk-redesign/en/awards/brownie/brownie-leadership-award/brownie-leadership-award',
    name: 'Brownie Leadership Award',
    imagePath: '/content/dam/gsusa-vtk-redesign/common/media/images/placeholders/badge-shape.png',
    family: 'High Award',
    programLevels: ['Brownie'],
    theme: 'Leadership and Your Future',
  },
];

const Engine = new (class implements SearchEngine {
  findActivities: (query: ActivityQuery) => Promise<ActivitySearchResult> = async (query: ActivityQuery) => {
    console.log('Mock activity search with query:', query);
    const limit = query.limit ?? 20;
    const page = query.page ?? 0;
    const start = page * limit;
    const slice = allActivities.slice(start, start + limit);
    return {
      total: allActivities.length,
      hits: slice.length,
      page,
      limit,
      results: slice,
    };
  };

  findBadges: (query: BadgeQuery) => Promise<BadgeSearchResult> = async (query: BadgeQuery) => {
    console.log('Mock badge search with query:', query);
    const limit = query.limit ?? 20;
    const page = query.page ?? 0;
    const start = page * limit;
    const slice = allBadges.slice(start, start + limit);
    return {
      total: allBadges.length,
      hits: slice.length,
      page,
      limit,
      results: slice,
    };
  };

  findBadgesAndAwards: (query: BadgeQuery) => Promise<BadgeSearchResult> = async (query: BadgeQuery) => {
    console.log('Mock badge+award search with query:', query);
    const limit = query.limit ?? 20;
    const page = query.page ?? 0;
    // Filters arrive as kebab-case ids (e.g. "true-north-award", "balanced-living",
    // "junior") derived from the AEM taxonomy path, while the mock data stores
    // human-readable display names. Normalise the display name to the same id form
    // before comparing so the real client query values match the mock entries.
    const toFilterId = (value: string) =>
      value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    let hits: BadgeHit[] = [...allBadges, ...allAwards.map(a => ({ ...a, type: 'award' as const }))];
    if (query.term) {
      const term = query.term.toLowerCase();
      hits = hits.filter(item => item.name?.toLowerCase().includes(term));
    }
    if (query.filters?.programLevel?.length) {
      hits = hits.filter(item =>
        item.type === 'award'
          ? item.programLevels?.some(p => query.filters!.programLevel!.includes(toFilterId(p)))
          : item.programLevel && query.filters!.programLevel!.includes(toFilterId(item.programLevel))
      );
    }
    if (query.filters?.theme?.length) {
      hits = hits.filter(item => item.theme && query.filters!.theme!.includes(toFilterId(item.theme)));
    }
    if (query.filters?.badgeFamily?.length) {
      hits = hits.filter(item => item.family && query.filters!.badgeFamily!.includes(toFilterId(item.family)));
    }
    const start = page * limit;
    const slice = hits.slice(start, start + limit);
    return {
      total: hits.length,
      hits: slice.length,
      page,
      limit,
      results: slice,
    };
  };
})();

/**
 * Mock implementation of SearchEngine for testing purposes.
 */
export default Engine as SearchEngine;
