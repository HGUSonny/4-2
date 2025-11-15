const API_URL = "https://691728f6a7a34288a27fc066.mockapi.io/v1/student";

const tbody = document.getElementById("data-table-body");
const messageArea = document.getElementById("message-area");

// Modal 관련
const dataModalEl = document.getElementById("dataModal");
const dataModal = new bootstrap.Modal(dataModalEl);
const modeText = document.querySelector("#dataModalLabel .mode-text");

const form = document.getElementById("data-form");
const formId = document.getElementById("form-id"); // MockAPI가 주는 id
const formName = document.getElementById("form-name"); // Name
const formAge = document.getElementById("form-age"); // Age
const formMajor = document.getElementById("form-major"); // Major
const formEmail = document.getElementById("form-email"); // E-Mail
const formNumber = document.getElementById("form-number"); // Number

const btnOpenAdd = document.getElementById("btn-open-add");

// 현재 모드: "create" or "edit"
let currentMode = "create";

// 메시지 표시 함수
function showMessage(text, type = "success") {
  messageArea.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${text}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>`;
}

// 테이블 렌더링
function renderTable(data) {
  tbody.innerHTML = "";
  if (!Array.isArray(data)) return;

  data.forEach((item, index) => {
    const tr = document.createElement("tr");

    // item.id : MockAPI가 자동으로 만든 PK
    // item.Number : 네 JSON에 있는 번호 필드
    const displayNumber = item.Number || index + 1;

    tr.innerHTML = `
      <td>${displayNumber}</td>
      <td>${item.Name}</td>
      <td>${item.Age}</td>
      <td>${item.Major}</td>
      <td>${item["E-Mail"]}</td>
      <td class="table-actions">
        <button class="btn btn-sm btn-warning btn-edit">수정</button>
        <button class="btn btn-sm btn-danger btn-delete">삭제</button>
      </td>
    `;

    // 수정 버튼 이벤트
    tr.querySelector(".btn-edit").addEventListener("click", () => {
      openEditModal(item);
    });

    // 삭제 버튼 이벤트
    tr.querySelector(".btn-delete").addEventListener("click", () => {
      if (confirm(`정말 삭제하시겠습니까? (번호: ${displayNumber})`)) {
        deleteData(item.id);
      }
    });

    tbody.appendChild(tr);
  });
}

// 데이터 목록 가져오기 (READ)
async function fetchData() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) {
      console.error("fetchData res:", res.status);
      throw new Error("데이터 불러오기 실패");
    }
    const data = await res.json();
    console.log("fetchData data[0] =", data[0]); // id 존재 여부 확인용
    renderTable(data);
  } catch (err) {
    console.error(err);
    showMessage("데이터를 불러오는 중 오류가 발생했습니다.", "danger");
  }
}

// CREATE (POST)
async function createData(payload) {
  try {
    console.log("createData payload =", payload);
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("createData error:", res.status, errorText);
      throw new Error("데이터 추가 실패");
    }
    showMessage("데이터가 성공적으로 추가되었습니다.");
    dataModal.hide();
    form.reset();
    fetchData();
  } catch (err) {
    console.error(err);
    showMessage("데이터 추가 중 오류가 발생했습니다.", "danger");
  }
}

// UPDATE (PUT)
async function updateData(id, payload) {
  const url = `${API_URL}/${id}`;
  console.log("updateData id/payload/url =", id, payload, url);

  try {
    const res = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("updateData error:", res.status, errorText);
      throw new Error("데이터 수정 실패");
    }

    showMessage("데이터가 성공적으로 수정되었습니다.");
    dataModal.hide();
    form.reset();
    fetchData();
  } catch (err) {
    console.error(err);
    showMessage("데이터 수정 중 오류가 발생했습니다.", "danger");
  }
}

// DELETE
async function deleteData(id) {
  const url = `${API_URL}/${id}`;
  console.log("deleteData id/url =", id, url);

  try {
    const res = await fetch(url, {
      method: "DELETE",
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("deleteData error:", res.status, errorText);
      throw new Error("데이터 삭제 실패");
    }
    showMessage("데이터가 성공적으로 삭제되었습니다.");
    fetchData();
  } catch (err) {
    console.error(err);
    showMessage("데이터 삭제 중 오류가 발생했습니다.", "danger");
  }
}

// 모달 열기 - 추가 모드
function openAddModal() {
  currentMode = "create";
  modeText.textContent = "데이터 추가";
  form.reset();
  formId.value = "";
  dataModal.show();
}

// 모달 열기 - 수정 모드
function openEditModal(item) {
  currentMode = "edit";
  modeText.textContent = "데이터 수정";

  // 🔴 여기서 반드시 item.id 를 숨겨진 input에 저장해야 함
  formId.value = item.id; // 이 id로 PUT / DELETE 요청

  formName.value = item.Name || "";
  formAge.value = item.Age || "";
  formMajor.value = item.Major || "";
  formEmail.value = item["E-Mail"] || "";
  formNumber.value = item.Number || "";

  console.log("openEditModal item =", item);
  dataModal.show();
}

// 폼 submit 이벤트
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const payload = {
    Name: formName.value.trim(),
    Age: Number(formAge.value),
    Major: formMajor.value.trim(),
    "E-Mail": formEmail.value.trim(), // 키에 하이픈 있어서 따옴표 필요
    Number: formNumber.value.trim(),
  };

  if (currentMode === "create") {
    createData(payload);
  } else if (currentMode === "edit") {
    const id = formId.value;
    updateData(id, payload);
  }
});

// "새 데이터 추가" 버튼 클릭 시
btnOpenAdd.addEventListener("click", openAddModal);

// 페이지 로딩 시 데이터 최초 1회 불러오기
window.addEventListener("DOMContentLoaded", fetchData);
