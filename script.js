const API_URL =
  "https://691728f6a7a34288a27fc066.mockapi.io/v1/:endpoint/students";

// DOM 요소
const list = document.getElementById("list");
const addBtn = document.getElementById("addBtn");
const nameInput = document.getElementById("name");
const ageInput = document.getElementById("age");

// --------------------
// READ : 목록 가져오기
// --------------------
async function getStudents() {
  const res = await fetch(API_URL);
  const data = await res.json();

  list.innerHTML = ""; // 초기화
  data.forEach((item) => {
    const li = document.createElement("li");
    li.innerHTML = `
      ${item.id}. ${item.name} (${item.age}세)
      <button onclick="deleteStudent(${item.id})">삭제</button>
    `;
    list.appendChild(li);
  });
}

// --------------------
// CREATE : 데이터 추가
// --------------------
async function addStudent() {
  const newData = {
    name: nameInput.value,
    age: ageInput.value,
  };

  await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newData),
  });

  nameInput.value = "";
  ageInput.value = "";

  getStudents(); // 새로고침
}

// --------------------
// DELETE : 삭제
// --------------------
async function deleteStudent(id) {
  await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  getStudents();
}

// --------------------
// 초기 실행
// --------------------
getStudents();

// 버튼 이벤트 연결
addBtn.addEventListener("click", addStudent);
