// ✅ 네 MockAPI 리소스 URL
const API_URL = "https://691728f6a7a34288a27fc066.mockapi.io/v1/students";

const tbody = document.getElementById("data-table-body");
const messageArea = document.getElementById("message-area");

// Modal 관련
const dataModalEl = document.getElementById("dataModal");
const dataModal = new bootstrap.Modal(dataModalEl);
const modeText = document.querySelector("#dataModalLabel .mode-text");

const form = document.getElementById("data-form");
const formId = document.getElementById("form-id"); // MockAPI id
const formNumber = document.getElementById("form-number"); // Number
const formName = document.getElementById("form-name"); // Name
const formMajor = document.getElementById("form-major"); // Major
const formSemester = document.getElementById("form-semester"); // semester

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

  data.forEach((item) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${item.Number}</td>
      <td>${item.Name}</td>
      <td>${item.Major}</td>
      <td>${item.semester}</td>
      <td class="table-actions">
        <button class="btn btn-sm btn-warning btn-edit">수정</button>
        <button class="btn btn-sm btn-danger btn-delete">삭제</button>
      </td>
    `;

    // 수정 버튼
    tr.querySelector(".btn-edit").addEventListener("click", () => {
      openEditModal(item);
    });

    // 삭제 버튼
    tr.querySelector(".btn-delete").addEventListener("click", () => {
      if (confirm(`정말 삭제하시겠습니까? (번호: ${item.Number})`)) {
        deleteData(item.id); // 🔑 MockAPI id 사용
      }
    });

    tbody.appendChild(tr);
  });
}

// READ (목록 불러오기)
async function fetchData() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("데이터 불러오기 실패");
    const data = await res.json();
    console.log("fetchData 예시:", data[0]);
    renderTable(data);
  } catch (err) {
    console.error(err);
    showMessage("데이터를 불러오는 중 오류가 발생했습니다.", "danger");
  }
}

// CREATE (추가)
async function createData(payload) {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("데이터 추가 실패");
    showMessage("데이터가 성공적으로 추가되었습니다.");
    dataModal.hide();
    form.reset();
    fetchData();
  } catch (err) {
    console.error(err);
    showMessage("데이터 추가 중 오류가 발생했습니다.", "danger");
  }
}

// UPDATE (수정)
async function updateData(id, payload) {
  const url = `${API_URL}/${id}`;
  console.log("updateData:", id, payload, url);

  try {
    const res = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const t = await res.text();
      console.error("updateData error:", res.status, t);
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

// DELETE (삭제)
async function deleteData(id) {
  const url = `${API_URL}/${id}`;
  console.log("deleteData:", id, url);

  try {
    const res = await fetch(url, { method: "DELETE" });

    if (!res.ok) {
      const t = await res.text();
      console.error("deleteData error:", res.status, t);
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

  // MockAPI에서 내려온 id 그대로 저장
  formId.value = item.id;

  formNumber.value = item.Number ?? "";
  formName.value = item.Name ?? "";
  formMajor.value = item.Major ?? "";
  formSemester.value = item.semester ?? "";

  console.log("openEditModal:", item);
  dataModal.show();
}

// 폼 submit
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const payload = {
    Number: Number(formNumber.value),
    Name: formName.value.trim(),
    Major: formMajor.value.trim(),
    semester: Number(formSemester.value),
  };

  if (currentMode === "create") {
    createData(payload);
  } else if (currentMode === "edit") {
    const id = formId.value;
    updateData(id, payload);
  }
});

// "새 데이터 추가" 버튼
btnOpenAdd.addEventListener("click", openAddModal);

// 페이지 로드 시 데이터 불러오기
window.addEventListener("DOMContentLoaded", fetchData);
