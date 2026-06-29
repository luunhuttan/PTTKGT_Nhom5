import random
import os

def generate_test_case(filename, n, max_budget, mode="random"):
    """
    Hàm sinh dữ liệu test tự động cho bài toán Quảng Cáo (Knapsack)
    Format output: 
    Dòng 1: n (số quảng cáo) W (ngân sách)
    n dòng tiếp theo: Cost Profit
    """
    with open(filename, 'w') as f:
        # Ghi dòng đầu tiên: n và W
        f.write(f"{n} {max_budget}\n")
        
        for _ in range(n):
            if mode == "random":
                # Chế độ 1: Ngẫu nhiên hoàn toàn
                cost = random.randint(10, int(max_budget / 5))
                profit = random.randint(20, int(max_budget / 2))
                
            elif mode == "equal_cost":
                # Chế độ 2: Chi phí bằng nhau, chỉ khác lợi nhuận 
                # (Dùng để xem Greedy có nhanh hơn DP mà vẫn đúng không)
                cost = 100 
                profit = random.randint(50, 500)
                
            elif mode == "greedy_trap":
                # Chế độ 3: Bẫy Greedy (Tỷ lệ Profit/Cost cao nhưng không tối ưu tổng thể)
                # Đánh lừa thuật toán Tham Lam chọn các món nhỏ lẻ, bỏ lỡ món to giá trị.
                cost = random.randint(10, 50)
                profit = cost * random.choice([2, 3]) + random.randint(-5, 5)
            
            # Đảm bảo dữ liệu luôn dương
            cost = max(1, cost)
            profit = max(1, profit)
            
            # Ghi vào file
            f.write(f"{cost} {profit}\n")
            
    print(f"✅ Đã xuất file: {filename:<30} | N = {n:<5} | Budget = {max_budget:<7} | Mode = {mode}")

# ==========================================
# THỰC THI (RUN KỊCH BẢN TEST)
# ==========================================

# 1. Tạo thư mục chứa data cho gọn gàng (nếu chưa có)
os.makedirs("test_data", exist_ok=True)

print("ĐANG TẠO BỘ DỮ LIỆU THỰC NGHIỆM...\n" + "-"*50)

# Mức độ 1: Data Nhỏ (Test logic xem code C++ có đọc/xuất đúng không)
generate_test_case("test_data/test_n10_random.txt", n=10, max_budget=1000, mode="random")

# Mức độ 2: Data Vừa (Mức tiệm cận giới hạn mảng tĩnh hiện tại của bạn là 100 và 5000)
#generate_test_case("test_data/test_n100_random.txt", n=100, max_budget=5000, mode="random")
#generate_test_case("test_data/test_n100_equal.txt", n=100, max_budget=5000, mode="equal_cost")
#generate_test_case("test_data/test_n100_trap.txt", n=100, max_budget=5000, mode="greedy_trap")

# Mức độ 3: Data Ép Xung (Stress Test)
# Lưu ý: Cần chỉnh MAX_ADS trong code C++ của bạn lên để chạy được file này nhé!
#generate_test_case("test_data/test_n500_random.txt", n=500, max_budget=10000, mode="random")

print("-" * 50)
print("HOÀN TẤT! Dữ liệu đã sẵn sàng để nạp vào C++.")