#include <algorithm>
#include <chrono>
#include <fstream>
#include <iomanip>
#include <iostream>
#include <limits>
#include <string>
#include <vector>

using namespace std;
using namespace std::chrono;

struct Ad {
  int id;
  long long profit;
  long long cost;
  double ratio;
};

int M = 0;
long long budget = 0;
vector<Ad> ads;

void rebuild_ratios() {
  for (Ad &ad : ads) {
    ad.ratio = (ad.cost > 0) ? (double)ad.profit / (double)ad.cost : 0.0;
  }
}

void sort_ads_by_ratio() {
  stable_sort(ads.begin(), ads.end(), [](const Ad &a, const Ad &b) {
    if (a.ratio != b.ratio) return a.ratio > b.ratio;
    if (a.profit != b.profit) return a.profit > b.profit;
    return a.id < b.id;
  });
}

void greedy_basic(vector<char> &selected) {
  selected.assign(M, 0);

  long long current_cost = 0;
  for (int i = 0; i < M; ++i) {
    if (current_cost + ads[i].cost <= budget) {
      selected[i] = 1;
      current_cost += ads[i].cost;
    }
  }
}

void greedy(vector<char> &selected) {
  sort_ads_by_ratio();
  greedy_basic(selected);
}

void evaluate_solution(const vector<char> &selected, long long &total_profit,
                       long long &total_cost) {
  total_profit = 0;
  total_cost = 0;

  for (int i = 0; i < M; ++i) {
    if (selected[i]) {
      total_profit += ads[i].profit;
      total_cost += ads[i].cost;
    }
  }
}

void print_solution(const vector<char> &selected, long long total_profit,
                    long long total_cost, const string &mode,
                    long long runtime_ms) {
  ofstream outfile("outputGreedy.txt");
  cout << "KET QUA TOI UU QUANG CAO" << endl;
  cout << "Mode: " << mode << endl;
  cout << "Tong profit: " << total_profit << endl;
  cout << "Tong cost: " << total_cost << endl;
  cout << "Budget: " << budget << endl;

  int count = 0;
  for (int i = 0; i < M; ++i) {
    if (selected[i]) ++count;
  }
  cout << "So luong quang cao duoc chon: " << count << "/" << M << endl;
  cout << "Thoi gian xu ly: " << runtime_ms << " ms" << endl;

  cout << "Danh sach ID duoc chon: ";
  for (int i = 0; i < M; ++i) {
    if (selected[i]) cout << ads[i].id << " ";
  }
  cout << endl;

  cout << "\nChi tiet cac quang cao duoc chon:" << endl;
  cout << left << setw(5) << "ID" << setw(12) << "Cost" << setw(12)
       << "Profit" << setw(15) << "Ratio" << endl;
  cout << "----------------------------------------" << endl;

  for (int i = 0; i < M; ++i) {
    if (selected[i]) {
      cout << left << setw(5) << ads[i].id << setw(12) << ads[i].cost
           << setw(12) << ads[i].profit << fixed << setprecision(4)
           << setw(15) << ads[i].ratio << endl;
    }
  }

  outfile << "KET QUA TOI UU QUANG CAO" << endl;
  outfile << "Mode: " << mode << endl;
  outfile << "Tong profit: " << total_profit << endl;
  outfile << "Tong cost: " << total_cost << endl;
  outfile << "Budget: " << budget << endl;
  outfile << "So luong quang cao duoc chon: " << count << "/" << M << endl;
  outfile << "Thoi gian xu ly: " << runtime_ms << " ms" << endl;
  outfile << "Danh sach ID duoc chon: ";
  for (int i = 0; i < M; ++i) {
    if (selected[i]) outfile << ads[i].id << " ";
  }
  outfile << endl;
  outfile.close();

  cout << "\nKet qua da duoc ghi vao file: outputGreedy.txt" << endl;
}

long long get_current_time_ms() {
  return duration_cast<milliseconds>(system_clock::now().time_since_epoch())
      .count();
}

bool load_from_keyboard() {
  cout << "Nhap so luong quang cao: ";
  cin >> M;
  while (cin.fail() || M <= 0) {
    cout << "Gia tri khong hop le. Nhap lai: ";
    cin.clear();
    cin.ignore(numeric_limits<streamsize>::max(), '\n');
    cin >> M;
  }

  cout << "Nhap ngan sach toi da: ";
  cin >> budget;
  while (cin.fail() || budget < 0) {
    cout << "Gia tri khong hop le. Nhap lai: ";
    cin.clear();
    cin.ignore(numeric_limits<streamsize>::max(), '\n');
    cin >> budget;
  }

  ads.assign(M, Ad{});
  for (int i = 0; i < M; ++i) {
    ads[i].id = i + 1;
    cout << "Quang cao " << (i + 1) << " - Chi phi: ";
    cin >> ads[i].cost;
    while (cin.fail() || ads[i].cost < 0) {
      cout << "Nhap lai chi phi hop le: ";
      cin.clear();
      cin.ignore(numeric_limits<streamsize>::max(), '\n');
      cin >> ads[i].cost;
    }
    cout << "Quang cao " << (i + 1) << " - Loi nhuan: ";
    cin >> ads[i].profit;
    while (cin.fail() || ads[i].profit < 0) {
      cout << "Nhap lai loi nhuan hop le: ";
      cin.clear();
      cin.ignore(numeric_limits<streamsize>::max(), '\n');
      cin >> ads[i].profit;
    }
  }

  rebuild_ratios();
  return true;
}

bool load_from_file() {
  string file_name;
  cout << "Nhap duong dan file (vd: test_data/test_n100_random.txt): ";
  cin >> file_name;

  ifstream inputFile(file_name);
  if (!inputFile.is_open()) {
    cout << "Loi: Khong the mo duoc file: " << file_name << endl;
    return false;
  }

  inputFile >> M >> budget;
  if (inputFile.fail() || M <= 0 || budget < 0) {
    cout << "Loi: File khong hop le (n budget)." << endl;
    return false;
  }

  ads.assign(M, Ad{});
  for (int i = 0; i < M; ++i) {
    if (!(inputFile >> ads[i].cost >> ads[i].profit)) {
      cout << "Loi: Du lieu file khong du dong." << endl;
      return false;
    }
    ads[i].id = i + 1;
  }
  inputFile.close();

  rebuild_ratios();
  cout << "Da load thanh cong " << M << " quang cao voi budget " << budget
       << " tu file!" << endl;
  return true;
}

int main() {
  cout << "=======================================================" << endl;
  cout << "  TOI UU HOA QUANG CAO TRUC TUYEN (GREEDY)" << endl;
  cout << "=======================================================" << endl << endl;

  int choice;
  cout << "Chon che do nhap du lieu: " << endl;
  cout << "1. Nguoi dung tu nhap tay" << endl;
  cout << "2. Doc tu file du lieu" << endl;
  cout << "Lua chon cua ban (1 hoac 2): ";
  if (!(cin >> choice)) return 1;

  if (choice == 1) {
    if (!load_from_keyboard()) return 1;
  } else if (choice == 2) {
    if (!load_from_file()) return 1;
  } else {
    cout << "Lua chon khong hop le. Ket thuc.\n";
    return 1;
  }

  if (budget == 0) {
    cout << "\nNgan sach bang 0 nen khong the chon quang cao nao" << endl;
    cout << "=> Loi nhuan bang 0" << endl;
    return 0;
  }

  if (M == 0) {
    cout << "\nSo quang cao bang 0 nen khong the chon quang cao nao" << endl;
    cout << "=> Loi nhuan bang 0" << endl;
    return 0;
  }

  cout << "\n[CHECK] n=" << M << " budget=" << budget << endl;
  int preview = min(M, 8);
  for (int i = 0; i < preview; ++i) {
    cout << " item " << (i + 1) << ": cost=" << ads[i].cost
         << " profit=" << ads[i].profit << endl;
  }

  ofstream inputFile("inputGreedy.txt", ios::app);
  if (inputFile.is_open()) {
    inputFile << "=======================================================" << endl;
    inputFile << "Budget: " << budget << endl;
    inputFile << "So luong quang cao: " << M << endl << endl;
    inputFile << left << setw(5) << "ID" << setw(12) << "Cost"
              << setw(12) << "Profit" << setw(15) << "Ratio" << endl;
    inputFile << "-------------------------------------------------------" << endl;
    for (int i = 0; i < M; ++i) {
      inputFile << left << setw(5) << ads[i].id << setw(12) << ads[i].cost
                << setw(12) << ads[i].profit << fixed << setprecision(4)
                << setw(15) << ads[i].ratio << endl;
    }
    inputFile << "=======================================================" << endl
              << endl;
    inputFile.close();
    cout << "[Da luu du lieu vao file inputGreedy.txt]" << endl;
  }

  vector<char> selected;
  long long total_profit = 0, total_cost = 0;
  long long start_time = get_current_time_ms();
  greedy(selected);
  long long end_time = get_current_time_ms();

  evaluate_solution(selected, total_profit, total_cost);
  print_solution(selected, total_profit, total_cost, "greedy",
                 end_time - start_time);
  return 0;
}