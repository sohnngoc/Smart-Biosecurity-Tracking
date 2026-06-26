def calculate_risk_score(events):
    """
    Tính toán điểm rủi ro dựa trên chuỗi sự kiện.
    Công thức:
    - Vào vùng cấm: +40
    - Chưa sát trùng: +25
    - Mất tín hiệu: +20
    - Sai tuyến: +15
    """
    score = 0
    if events.get('entered_forbidden_zone'):
        score += 40
    if not events.get('sanitized'):
        score += 25
    if events.get('signal_lost'):
        score += 20
    if events.get('wrong_route'):
        score += 15
        
    # Phân loại mức rủi ro
    level = "Thấp"
    if score > 30 and score <= 60:
        level = "Trung bình"
    elif score > 60 and score <= 80:
        level = "Cao"
    elif score > 80:
        level = "Nghiêm trọng"
        
    return {
        "score": score,
        "risk_level": level
    }

if __name__ == "__main__":
    # Test
    sample_event = {
        "entered_forbidden_zone": True,
        "sanitized": False,
        "signal_lost": False,
        "wrong_route": False
    }
    result = calculate_risk_score(sample_event)
    print(f"Điểm rủi ro: {result['score']} - Mức độ: {result['risk_level']}")
