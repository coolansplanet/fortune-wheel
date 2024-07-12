const defaultTeamMembers = [
  { name: "Example 1", isEnabled: true },
  { name: "Example 2", isEnabled: true },
  { name: "Example 3", isEnabled: true },
  { name: "Example 4", isEnabled: true },
  { name: "Example 5", isEnabled: true },
  { name: "Example 6", isEnabled: true },
  { name: "Example 7", isEnabled: true },
  { name: "Example 8", isEnabled: true },
];

const stringifiedMembers = localStorage.getItem("allMembers");
const allMembers = [];
const team = [];

const saveFullList = () => {
  localStorage.setItem(
    "allMembers",
    JSON.stringify(allMembers.map(({ li, ...rest }) => rest))
  );
};

if (!!stringifiedMembers) {
  JSON.parse(stringifiedMembers).forEach((oneMember) =>
    allMembers.push(oneMember)
  );
} else {
  localStorage.setItem("allMembers", JSON.stringify(defaultTeamMembers));
  defaultTeamMembers.forEach((oneMember) => allMembers.push(oneMember));
}

const element = {
  settingsBoxTeam: document.querySelector(".settings-box-team-list"),
  wheel: document.querySelector("#wheel"),
  wheelContainer: document.querySelector(".wheel-container"),
  goButton: document.querySelector(".go-button"),
  settingsButton: document.querySelector(".gear-button"),
  list: document.querySelector(".list-side"),
  winnerBanner: document.querySelector(".winner"),
  settingsScreen: document.querySelector(".settings"),
  settingsBox: document.querySelector(".settings-box"),
  okButton: document.querySelector(".settings-box .ok"),
  newMemberItem: document.querySelector(".settings-box-team-list .new-member"),
  newMemberInput: document.querySelector(
    ".settings-box-team-list .new-member input"
  ),
};

const colors = ["#FFAEBC", "#FBE7C6", "#B4F8C8", "#A0E7E5"];

const winners = [];

const medalList = Array.from(document.querySelectorAll("#medals .medal")).map(
  (oneMedal) => oneMedal.src
);

const rotatingMilliseconds = 5000;

const wheelRadius = 5;

const fragmentStaticAttributes = {
  r: wheelRadius,
  cx: wheelRadius * 2,
  cy: wheelRadius * 2,
  fill: "transparent",
  "stroke-width": wheelRadius * 2,
};

const rootStyle = getComputedStyle(document.documentElement);

const winnerAnimationMilliseconds = parseInt(
  rootStyle.getPropertyValue("--winner-animation-time")
);

element.winnerBanner.addEventListener("click", (e) => {
  team.length > 1 && element.goButton.removeAttribute("disabled");
  element.settingsButton.removeAttribute("disabled");
  element.winnerBanner.classList.remove("display");
});

let angleMargin;
let degrees;

const setAttributes = (element, attributes = {}, ns = false) => {
  Object.entries(attributes).forEach(([name, value]) => {
    ns
      ? element.setAttributeNS(null, name, value)
      : element.setAttribute(name, value);
  });
};

const addWinnerToList = (winner, medal) => {
  const winnerElement = document.createElement("div");
  winnerElement.classList.add("winner-element");
  const winnerName = document.createElement("p");
  winnerName.append(winner.name);
  winnerElement.append(winnerName);
  winnerElement.append(medal);
  winnerElement.style.height = 50;
  element.list.append(winnerElement);
  winners.push({ name: winner.name, element: winnerElement });
};

const removeWinnerFromList = (name) => {
  const index = winners.findIndex((oneWinner) => oneWinner.name === name);
  index >= 0 && element.list.removeChild(winners.splice(index, 1)[0].element);
};

const sortItems = (list) =>
  list.sort((a, b) => {
    const nameA = a.name.toLowerCase();
    const nameB = b.name.toLowerCase();
    return nameA < nameB ? -1 : nameA > nameB ? 1 : 0;
  });

const generateWheel = () => {
  angleMargin = Math.round(360 / (team.length * 2));
  while (element.wheel.firstChild) {
    element.wheel.removeChild(element.wheel.lastChild);
  }
  document.querySelectorAll(".name").forEach((oneName) => {
    oneName.parentNode.removeChild(oneName);
  });

  team.forEach((oneParticipant, index) => {
    const color = colors[index % colors.length];

    oneParticipant.color =
      index === team.length - 1 && color === team[0].color
        ? colors[Math.ceil(colors.length / 2) - 1]
        : color;

    const angle = (index * 360) / team.length;
    const nameElement = document.createElement("p");
    nameElement.classList.add("name");
    nameElement.style.rotate = `${angle + angleMargin}deg`;
    nameElement.append(oneParticipant.name);
    const wheelFragment = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );

    const fragmentAttributes = {
      ...fragmentStaticAttributes,
      stroke: oneParticipant.color,
      "stroke-dasharray": `${31.4 / team.length} 31.4`,
      transform: `rotate(${angle} 10 10)`,
    };
    setAttributes(wheelFragment, fragmentAttributes, true);

    element.wheel.appendChild(wheelFragment);
    element.wheelContainer.append(nameElement);
  });

  degrees = angleMargin;
};

const removeItem = (name, list) => {
  const index = list.findIndex((oneMember) => oneMember.name === name);
  index >= 0 && list.splice(index, 1);
};

const addMemberAsElement = (oneItem, id) => {
  const listItem = document.createElement("li");
  const checkbox = document.createElement("input");
  const text = document.createElement("label");
  const button = document.createElement("button");
  checkbox.setAttribute("type", "checkbox");
  checkbox.setAttribute("id", id);
  checkbox.checked = oneItem.isEnabled;

  button.addEventListener("click", () => {
    const theUserIsSure = confirm(
      `Are you sure you want to remove ${oneItem.name} from the list?`
    );
    if (theUserIsSure) {
      removeItem(oneItem.name, allMembers);
      removeItem(oneItem.name, team);
      removeWinnerFromList(oneItem.name);
      element.settingsBoxTeam.removeChild(oneItem.li);
      generateWheel();
      saveFullList();
    }
  });
  checkbox.addEventListener("change", (e) => {
    const member = allMembers.find(
      (oneMember) => oneMember.name === oneItem.name
    );
    member.isEnabled = e.target.checked;
    if (e.target.checked) {
      team.push(member);
      sortItems(team);
    } else {
      removeItem(oneItem.name, team);
      removeWinnerFromList(oneItem.name);
    }
    generateWheel();
    saveFullList();
  });
  text.setAttribute("for", id);
  text.append(oneItem.name);
  listItem.appendChild(checkbox);
  listItem.appendChild(text);
  listItem.appendChild(button);
  element.settingsBoxTeam.insertBefore(listItem, element.newMemberItem);
  oneItem.li = listItem;
};

element.newMemberInput.addEventListener("keydown", (e) => {
  const text = e.target.value;
  if (
    e.key === "Enter" &&
    !!text &&
    typeof text === "string" &&
    text.length > 0
  ) {
    if (
      allMembers.find(
        (oneMember) => oneMember.name.toLowerCase() === text.toLowerCase()
      )
    ) {
      alert("That name is already in the list, please use a different one");
      return null;
    }

    const newItem = {
      name: text
        .split(" ")
        .map(
          (oneFragment) =>
            oneFragment.charAt(0).toUpperCase() +
            oneFragment.slice(1).toLocaleLowerCase()
        )
        .join(" "),
      isEnabled: true,
    };
    allMembers.push(newItem);
    sortItems(allMembers);
    saveFullList();
    addMemberAsElement(newItem, "member-" + text);
    team.push(newItem);
    sortItems(team);
    generateWheel();
    element.newMemberInput.value = "";
  }
});
allMembers.forEach((oneMember, index) => {
  addMemberAsElement(oneMember, "member-" + index);
  oneMember.isEnabled && team.push(oneMember);
});
generateWheel();

element.goButton.addEventListener("click", (e) => {
  e.target.setAttribute("disabled", true);
  element.settingsButton.setAttribute("disabled", true);
  element.wheelContainer.style.transition = `rotate ${rotatingMilliseconds}ms`;
  const index = Math.floor(Math.random() * team.length);
  const angle = (360 / team.length) * index;

  degrees += 360 * 7 + angle;

  element.wheelContainer.style.rotate = `${Math.round(degrees)}deg`;

  const medalIndex =
    winners.length > medalList.length - 2
      ? medalList.length - 2
      : winners.length;

  const medal = document.createElement("img");
  medal.src = medalList[medalIndex];
  setTimeout(() => {
    const winnerIndex = team.length - 1 - index;

    const winner = team.splice(winnerIndex, 1)[0];

    element.winnerBanner.querySelector(".winner-name").innerHTML = winner.name;
    element.winnerBanner.querySelector(".winner-medal").innerHTML = "";
    element.winnerBanner.querySelector(".winner-medal").appendChild(medal);
    element.winnerBanner.querySelector(".winner-box").style.backgroundColor =
      winner.color;
    element.winnerBanner.classList.add("display");
    addWinnerToList(winner, medal.cloneNode(true));
    if (team.length === 1) {
      const lastMedal = document.createElement("img");
      lastMedal.src = medalList[medalList.length - 1];
      addWinnerToList(team.pop(), lastMedal);
      element.wheelContainer.style.opacity = 0.2;
    } else {
      setTimeout(() => {
        element.wheelContainer.style.transition = "";
        element.wheelContainer.style.rotate = "0deg";
        generateWheel();
      }, winnerAnimationMilliseconds);
    }
  }, rotatingMilliseconds);
});

element.settingsButton.addEventListener("click", () => {
  element.settingsScreen.classList.add("display");
});

element.settingsScreen.addEventListener("click", () => {
  element.settingsScreen.classList.remove("display");
});

element.okButton.addEventListener("click", () => {
  element.settingsScreen.classList.remove("display");
});

element.settingsBox.addEventListener("click", (e) => {
  e.stopPropagation();
});
