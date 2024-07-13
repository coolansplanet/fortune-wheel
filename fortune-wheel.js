let angleMargin;
let degrees;

const players = [];

const colors = ["#FFAEBC", "#FBE7C6", "#B4F8C8", "#A0E7E5"];

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

const medalList = Array.from(document.querySelectorAll("#medals .medal")).map(
  (oneMedal) => oneMedal.src
);

const element = {
  create: (name) => document.createElement(name),
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

const removeItem = (name) => ({
  from: (list) => {
    const index = list.findIndex((oneMember) => oneMember.name === name);
    return index >= 0 ? list.splice(index, 1)[0] : undefined;
  },
});

const sortItems = (list) =>
  list.sort((a, b) => {
    const nameA = a.name.toLowerCase();
    const nameB = b.name.toLowerCase();
    return nameA < nameB ? -1 : nameA > nameB ? 1 : 0;
  });

const allMembers = {
  list: [],
  default: [
    { name: "Example 1", isEnabled: true },
    { name: "Example 2", isEnabled: true },
    { name: "Example 3", isEnabled: true },
    { name: "Example 4", isEnabled: true },
    { name: "Example 5", isEnabled: true },
    { name: "Example 6", isEnabled: true },
    { name: "Example 7", isEnabled: true },
    { name: "Example 8", isEnabled: true },
  ],
  add: (newMember) => {
    allMembers.list.push(newMember);
    sortItems(allMembers.list);
    allMembers.save();
    newMember.isEnabled && players.push(newMember);
    const id = "member-" + newMember.name.toLowerCase();
    const listItem = element.create("li");
    const checkbox = element.create("input");
    const text = element.create("label");
    const button = element.create("button");
    checkbox.setAttribute("type", "checkbox");
    checkbox.setAttribute("id", id);
    checkbox.checked = newMember.isEnabled;

    button.addEventListener("click", () => {
      const theUserIsSure = confirm(
        `Are you sure you want to remove ${newMember.name} from the list?`
      );
      if (theUserIsSure) {
        removeItem(newMember.name).from(allMembers.list);
        removeItem(newMember.name).from(players);
        winners.remove(newMember.name);
        element.settingsBoxTeam.removeChild(newMember.li);
        generateWheel();
        allMembers.save();
      }
    });
    checkbox.addEventListener("change", (e) => {
      const member = allMembers.list.find(
        (oneMember) => oneMember.name === newMember.name
      );
      member.isEnabled = e.target.checked;
      if (e.target.checked) {
        players.push(member);
        sortItems(players);
      } else {
        removeItem(newMember.name).from(players);
        winners.remove(newMember.name);
      }
      generateWheel();
      allMembers.save();
    });
    text.setAttribute("for", id);
    text.append(newMember.name);
    listItem.appendChild(checkbox);
    listItem.appendChild(text);
    listItem.appendChild(button);
    element.settingsBoxTeam.insertBefore(listItem, element.newMemberItem);
    newMember.li = listItem;
  },
  load: () => {
    const stringifiedMembers = localStorage.getItem("allMembers");
    if (!!stringifiedMembers) {
      JSON.parse(stringifiedMembers).forEach((oneMember) =>
        allMembers.add(oneMember)
      );
    } else {
      allMembers.default.forEach((oneMember) => allMembers.add(oneMember));
    }
  },
  save: () => {
    localStorage.setItem(
      "allMembers",
      JSON.stringify(allMembers.list.map(({ li, ...rest }) => rest))
    );
  },
};

const winners = {
  array: [],
  add: (winner, medal) => {
    const winnerElement = element.create("div");
    winnerElement.classList.add("winner-element");
    const winnerName = element.create("p");
    winnerName.append(winner.name);
    winnerElement.append(winnerName);
    winnerElement.append(medal);
    winnerElement.style.height = 50;
    element.list.append(winnerElement);
    winners.array.push({ name: winner.name, element: winnerElement });
  },
  remove: (name) => {
    const winnerRemoved = removeItem(name).from(winners.array);
    !!winnerRemoved && element.list.removeChild(winnerRemoved.element);
  },
  get length() {
    return winners.array.length;
  },
};

const setAttributes = (element, attributes = {}, ns = false) => {
  Object.entries(attributes).forEach(([name, value]) => {
    ns
      ? element.setAttributeNS(null, name, value)
      : element.setAttribute(name, value);
  });
};

allMembers.load();

element.winnerBanner.addEventListener("click", () => {
  players.length > 1 && element.goButton.removeAttribute("disabled");
  element.settingsButton.removeAttribute("disabled");
  element.winnerBanner.classList.remove("display");
});

const generateWheel = () => {
  angleMargin = Math.round(360 / (players.length * 2));
  while (element.wheel.firstChild) {
    element.wheel.removeChild(element.wheel.lastChild);
  }
  document.querySelectorAll(".name").forEach((oneName) => {
    oneName.parentNode.removeChild(oneName);
  });

  players.forEach((oneParticipant, index) => {
    const color = colors[index % colors.length];

    oneParticipant.color =
      index === players.length - 1 && color === players[0].color
        ? colors[Math.ceil(colors.length / 2) - 1]
        : color;

    const angle = (index * 360) / players.length;
    const nameElement = element.create("p");
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
      "stroke-dasharray": `${31.4 / players.length} 31.4`,
      transform: `rotate(${angle} 10 10)`,
    };
    setAttributes(wheelFragment, fragmentAttributes, true);

    element.wheel.appendChild(wheelFragment);
    element.wheelContainer.append(nameElement);
  });

  degrees = angleMargin;
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
      allMembers.list.find(
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

    allMembers.add(newItem);
    sortItems(players);
    generateWheel();
    element.newMemberInput.value = "";
  }
});

generateWheel();

element.goButton.addEventListener("click", (e) => {
  e.target.setAttribute("disabled", true);
  element.settingsButton.setAttribute("disabled", true);
  element.wheelContainer.style.transition = `rotate ${rotatingMilliseconds}ms`;
  const index = Math.floor(Math.random() * players.length);
  const angle = (360 / players.length) * index;

  degrees += 360 * 7 + angle;

  element.wheelContainer.style.rotate = `${Math.round(degrees)}deg`;

  const medalIndex =
    winners.length > medalList.length - 2
      ? medalList.length - 2
      : winners.length;

  const medal = element.create("img");
  medal.src = medalList[medalIndex];
  setTimeout(() => {
    const winnerIndex = players.length - 1 - index;

    const winner = players.splice(winnerIndex, 1)[0];

    element.winnerBanner.querySelector(".winner-name").innerHTML = winner.name;
    element.winnerBanner.querySelector(".winner-medal").innerHTML = "";
    element.winnerBanner.querySelector(".winner-medal").appendChild(medal);
    element.winnerBanner.querySelector(".winner-box").style.backgroundColor =
      winner.color;
    element.winnerBanner.classList.add("display");
    winners.add(winner, medal.cloneNode(true));
    if (players.length === 1) {
      const lastMedal = element.create("img");
      lastMedal.src = medalList[medalList.length - 1];
      winners.add(players.pop(), lastMedal);
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
