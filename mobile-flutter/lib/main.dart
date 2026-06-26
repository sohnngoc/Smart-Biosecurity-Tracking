import 'package:flutter/material.dart';

void main() {
  runApp(const SmartBiosecurityApp());
}

class SmartBiosecurityApp extends StatelessWidget {
  const SmartBiosecurityApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Hệ Thống Theo Dõi An Toàn Sinh Học Thông Minh',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.teal),
        useMaterial3: true,
      ),
      home: const ManHinhDangNhap(),
    );
  }
}

class ManHinhDangNhap extends StatelessWidget {
  const ManHinhDangNhap({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Đăng nhập'),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text(
              'Hệ Thống Theo Dõi An Toàn Sinh Học Thông Minh',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            const Text('Phòng ngừa. Truy vết. Bảo vệ.'),
            const SizedBox(height: 32),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 32.0),
              child: TextField(
                decoration: const InputDecoration(
                  labelText: 'Tài khoản',
                  border: OutlineInputBorder(),
                ),
              ),
            ),
            const SizedBox(height: 16),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 32.0),
              child: TextField(
                obscureText: true,
                decoration: const InputDecoration(
                  labelText: 'Mật khẩu',
                  border: OutlineInputBorder(),
                ),
              ),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () {
                // Xử lý đăng nhập
              },
              child: const Text('Đăng nhập'),
            ),
          ],
        ),
      ),
    );
  }
}
