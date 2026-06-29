#define _CRT_SECURE_NO_WARNINGS
#include <iostream>
#include <iomanip>
#include <fstream>
#include <ctime>
#include <vector>
#include <string>
#include <limits>

using namespace std;

int knapsack(const vector<int>& cost, const vector<int>& profit, int n, int W,
             vector<vector<int>>& dp, vector<vector<char>>& chosen) {
    for (int i = 0; i <= n; ++i)
        for (int w = 0; w <= W; ++w) {
            dp[i][w] = 0;
            chosen[i][w] = 0;
        }

    for (int i = 1; i <= n; ++i) {
        for (int w = 1; w <= W; ++w) {
            dp[i][w] = dp[i-1][w];
            chosen[i][w] = 0;
            if (w >= cost[i]) {
                int pick = dp[i-1][w - cost[i]] + profit[i];
                if (pick > dp[i][w]) {
                    dp[i][w] = pick;
                    chosen[i][w] = 1;
                }
            }
        }
    }
    return dp[n][W];
}

void traceBack(const vector<int>& cost, int n, int W,
               const vector<vector<char>>& chosen, vector<int>& selected) {
    fill(selected.begin(), selected.end(), 0);
    int w = W;
    for (int i = n; i >= 1; --i) {
        if (w >= 0 && chosen[i][w]) {
            selected[i] = 1;
            w -= cost[i];
        }
    }
}

int bruteForce(const vector<int>& cost, const vector<int>& profit, int n, int W) {
    if (n > 25) return -1; // too big to brute-force
    int best = 0;
    int limit = 1 << n;
    for (int mask = 0; mask < limit; ++mask) {
        int sc = 0, sp = 0;
        for (int i = 0; i < n; ++i) {
            if (mask & (1 << i)) {
                sc += cost[i+1];
                sp += profit[i+1];
            }
        }
        if (sc <= W && sp > best) best = sp;
    }
    return best;
}

int main() {
    const long long SAFE_CELLS_LIMIT = 500000000LL; // limit (n+1)*(W+1)
    int n = 0, W = 0;
    cout << "=======================================================" << endl;
    cout << "  TOI UU HOA QUANG CAO TRUC TUYEN (KNAPSACK 0/1)" << endl;
    cout << "=======================================================" << endl << endl;

    int choice;
    cout << "Chon che do nhap du lieu: " << endl;
    cout << "1. Nguoi dung tu nhap tay" << endl;
    cout << "2. Doc tu file du lieu" << endl;
    cout << "Lua chon cua ban (1 hoac 2): ";
    if (!(cin >> choice)) return 1;

    vector<int> cost, profit, selected;
    if (choice == 1) {
        cout << "Nhap so luong quang cao: ";
        cin >> n;
        while (cin.fail() || n <= 0) {
            cout << "Gia tri khong hop le. Nhap lai: ";
            cin.clear();
            cin.ignore(numeric_limits<streamsize>::max(), '\n');
            cin >> n;
        }

        cout << "Nhap ngan sach toi da: ";
        cin >> W;
        while (cin.fail() || W < 0) {
            cout << "Gia tri khong hop le. Nhap lai: ";
            cin.clear();
            cin.ignore(numeric_limits<streamsize>::max(), '\n');
            cin >> W;
        }

        cost.assign(n+1, 0);
        profit.assign(n+1, 0);
        for (int i = 1; i <= n; ++i) {
            cout << "Quang cao " << i << " - Chi phi: ";
            cin >> cost[i];
            while (cin.fail() || cost[i] < 0) {
                cout << "Nhap lai chi phi hop le: ";
                cin.clear();
                cin.ignore(numeric_limits<streamsize>::max(), '\n');
                cin >> cost[i];
            }
            cout << "Quang cao " << i << " - Loi nhuan: ";
            cin >> profit[i];
            while (cin.fail() || profit[i] < 0) {
                cout << "Nhap lai loi nhuan hop le: ";
                cin.clear();
                cin.ignore(numeric_limits<streamsize>::max(), '\n');
                cin >> profit[i];
            }
        }
    } else if (choice == 2) {
        string file_name;
        cout << "Nhap duong dan file (vd: test_data/test_n100_random.txt): ";
        cin >> file_name;
        ifstream inputFile(file_name);
        if (!inputFile.is_open()) {
            cout << "Loi: Khong the mo duoc file: " << file_name << endl;
            return 1;
        }
        inputFile >> n >> W;
        if (inputFile.fail() || n <= 0 || W < 0) {
            cout << "Loi: File khong hop le (n W)." << endl;
            return 1;
        }
        cost.assign(n+1, 0);
        profit.assign(n+1, 0);
        for (int i = 1; i <= n; ++i) {
            if (!(inputFile >> cost[i] >> profit[i])) {
                cout << "Loi: Du lieu file khong du dong.\n";
                return 1;
            }
        }
        inputFile.close();
        cout << "Da load thanh cong " << n << " Quang cao voi ngan sach " << W << " tu file! " << endl;
    } else {
        cout << "Lua chon khong hop le. Ket thuc.\n";
        return 1;
    }

    // Print quick check of input
    cout << "\n[CHECK] n=" << n << " W=" << W << "\n";
    int preview = min(n, 8);
    for (int i = 1; i <= preview; ++i) {
        cout << " item " << i << ": cost=" << cost[i] << " profit=" << profit[i] << "\n";
    }

    // Safety check before allocating dp
    long long cells = (long long)(n + 1) * (long long)(W + 1);
    if (cells > SAFE_CELLS_LIMIT) {
        cout << "\nLoi: (n+1)*(W+1) = " << cells << " vuot nguong an toan (" << SAFE_CELLS_LIMIT << ").\n";
        cout << "Ban co the: giam W hoac n, hoac chuyen sang DP 1-chieu/phan tich toan bo.\n";
        return 1;
    }

    // allocate dp and chosen
    vector<vector<int>> dp(n+1, vector<int>(W+1, 0));
    vector<vector<char>> chosen(n+1, vector<char>(W+1, 0));
    selected.assign(n+1, 0);

    int maxProfit = knapsack(cost, profit, n, W, dp, chosen);
    traceBack(cost, n, W, chosen, selected);

    cout << "\n=======================================================" << endl;
    cout << "  KET QUA TOI UU" << endl;
    cout << "=======================================================" << endl;
    cout << "Loi nhuan toi da: " << maxProfit << endl << endl;

    cout << "Cac quang cao duoc chon:" << endl;
    cout << left << setw(5) << "ID" << setw(15) << "Chi phi"
         << setw(15) << "Loi nhuan" << setw(15) << "Ty le ROI" << endl;
    cout << "-------------------------------------------------------" << endl;

    int totalCost = 0;
    for (int i = 1; i <= n; ++i) {
        if (selected[i] == 1) {
            float roi = cost[i] > 0 ? (float)(profit[i] - cost[i]) / cost[i] * 100.0f : 0.0f;
            cout << left << setw(5) << i << setw(15) << cost[i]
                 << setw(15) << profit[i] << fixed << setprecision(2)
                 << setw(14) << roi << "%" << endl;
            totalCost += cost[i];
        }
    }
    cout << "-------------------------------------------------------" << endl;
    cout << "Tong chi phi su dung: " << totalCost << " / " << W << endl;
    cout << "Ngan sach con lai: " << (W - totalCost) << endl;
    cout << "=======================================================" << endl;

    // Verify selected sum matches dp result
    int chkProfit = 0;
    for (int i = 1; i <= n; ++i) if (selected[i]) chkProfit += profit[i];
    if (chkProfit != maxProfit) {
        cout << "[WARN] Tong profit cua cac muc duoc chon (" << chkProfit
             << ") khong bang dp[n][W] (" << maxProfit << ")\n";
    } else {
        cout << "[OK] Kiem tra loi nhuan khop: " << chkProfit << "\n";
    }

    // Brute-force comparison for small n
    if (n <= 25) {
        int bf = bruteForce(cost, profit, n, W);
        if (bf >= 0) {
            cout << "Brute-force best = " << bf << ", DP = " << maxProfit << "\n";
            if (bf != maxProfit) cout << "[ERROR] DP khac brute-force!\n";
        }
    }

    // Print DP sampling table (adaptive)
    cout << "\n--- Bang QHD (mau) ---" << endl;
    cout << "dp[i][w]: Loi nhuan toi da khi xet i quang cao voi ngan sach w" << endl << endl;
    int displayCols = 50;
    cout << "Nhap so cot muon in (mac dinh 50): ";
    if (!(cin >> displayCols)) displayCols = 50;
    if (displayCols <= 0) displayCols = 50;
    if (W < displayCols) displayCols = W;

    int step = 1;
    if (W > 0) step = (W + displayCols - 1) / displayCols;

    vector<int> cols;
    for (int ww = 0; ww <= W; ww += step) cols.push_back(ww);
    if (cols.empty() || cols.back() != W) cols.push_back(W);

    cout << "    ";
    for (int c : cols) cout << setw(6) << c;
    cout << endl;

    for (int i = 0; i <= min(n, 200); ++i) { // limit rows printed to avoid too large output
        cout << setw(3) << i << ": ";
        int prev = -1;
        for (int c : cols) {
            int v = dp[i][c];
            if (v != prev) {
                cout << setw(6) << v;
                prev = v;
            } else {
                cout << setw(6) << " ";
            }
        }
        cout << endl;
    }

    return 0;
}
