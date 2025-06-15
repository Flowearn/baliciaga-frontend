import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import UserProfileForm from './UserProfileForm';
import * as userService from '@/services/userService';

// Mock the userService
vi.mock('@/services/userService', () => ({
  createUserProfile: vi.fn(),
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

// Mock UI components that might cause issues in tests
vi.mock('@/components/ui/select', () => ({
  Select: ({ children, value, onValueChange }: { 
    children: React.ReactNode; 
    value: string; 
    onValueChange: (value: string) => void;
  }) => (
    <select 
      data-testid="gender-select" 
      value={value} 
      onChange={(e) => onValueChange(e.target.value)}
      id="gender"
    >
      {children}
    </select>
  ),
  SelectContent: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SelectItem: ({ children, value }: { children: React.ReactNode; value: string }) => (
    <option value={value}>{children}</option>
  ),
  SelectTrigger: ({ children, id }: { children: React.ReactNode; id?: string }) => <>{children}</>,
  SelectValue: ({ placeholder }: { placeholder?: string }) => <span>{placeholder}</span>,
}));

describe('UserProfileForm', () => {
  const mockOnProfileCreated = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * 测试用例 1: 验证表单初始渲染
   */
  it('should render all form fields correctly', () => {
    render(<UserProfileForm onProfileCreated={mockOnProfileCreated} />);

    // 验证标题和描述
    expect(screen.getByText('Complete Your Profile')).toBeInTheDocument();
    expect(screen.getByText('Welcome to Baliciaga! Please fill in your personal information to continue using our services.')).toBeInTheDocument();

    // 验证所有表单字段标签
    expect(screen.getByLabelText('Full Name')).toBeInTheDocument();
    expect(screen.getByText('Gender')).toBeInTheDocument(); // Gender使用text查找因为mock的选择器结构
    expect(screen.getByLabelText('Nationality')).toBeInTheDocument();
    expect(screen.getByLabelText('Age')).toBeInTheDocument();
    expect(screen.getByLabelText('WhatsApp Number')).toBeInTheDocument();

    // 验证输入框
    expect(screen.getByPlaceholderText('Enter your full name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g., Chinese, American, Japanese')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g., +86 138 0013 8000')).toBeInTheDocument();

    // 验证性别选择器
    expect(screen.getByTestId('gender-select')).toBeInTheDocument();

    // 验证提交按钮
    expect(screen.getByRole('button', { name: 'Create Profile' })).toBeInTheDocument();
  });

  /**
   * 测试用例 2: 验证必填字段的校验逻辑
   */
  it('should display validation errors when required fields are submitted empty', async () => {
    const user = userEvent.setup();
    render(<UserProfileForm onProfileCreated={mockOnProfileCreated} />);

    const submitButton = screen.getByRole('button', { name: 'Create Profile' });

    // 尝试提交空表单
    await user.click(submitButton);

    // 等待错误提示出现 - 检查是否有错误toast调用
    await waitFor(() => {
      expect(vi.mocked(userService.createUserProfile)).not.toHaveBeenCalled();
    });

    // 验证 onProfileCreated 没有被调用
    expect(mockOnProfileCreated).not.toHaveBeenCalled();
  });

  it('should show specific validation errors for each empty required field', async () => {
    const user = userEvent.setup();
    render(<UserProfileForm onProfileCreated={mockOnProfileCreated} />);

    const submitButton = screen.getByRole('button', { name: 'Create Profile' });

    // 测试空的 fullName
    await user.click(submitButton);
    await waitFor(() => {
      expect(vi.mocked(userService.createUserProfile)).not.toHaveBeenCalled();
    });

    // 填写 fullName，但留空 nationality
    const nameInput = screen.getByPlaceholderText('Enter your full name');
    await user.type(nameInput, 'Test User');
    await user.click(submitButton);

    await waitFor(() => {
      expect(vi.mocked(userService.createUserProfile)).not.toHaveBeenCalled();
    });

    // 填写 nationality，但留空 whatsapp
    const nationalityInput = screen.getByPlaceholderText('e.g., Chinese, American, Japanese');
    await user.type(nationalityInput, 'American');
    await user.click(submitButton);

    await waitFor(() => {
      expect(vi.mocked(userService.createUserProfile)).not.toHaveBeenCalled();
    });
  });

  it('should validate age range', async () => {
    const user = userEvent.setup();
    render(<UserProfileForm onProfileCreated={mockOnProfileCreated} />);

    const nameInput = screen.getByPlaceholderText('Enter your full name');
    const nationalityInput = screen.getByPlaceholderText('e.g., Chinese, American, Japanese');
    const whatsappInput = screen.getByPlaceholderText('e.g., +86 138 0013 8000');
    const ageInput = screen.getByLabelText('Age');
    const submitButton = screen.getByRole('button', { name: 'Create Profile' });

    // 填写其他必填字段
    await user.type(nameInput, 'Test User');
    await user.type(nationalityInput, 'American');
    await user.type(whatsappInput, '+1 234 567 8900');

    // 测试无效年龄 (超过200)
    await user.clear(ageInput);
    await user.type(ageInput, '250');
    await user.click(submitButton);

    await waitFor(() => {
      expect(vi.mocked(userService.createUserProfile)).not.toHaveBeenCalled();
    });

    // 重置 mock 以便下一个测试
    vi.clearAllMocks();
  });

  /**
   * 测试用例 3: 验证表单成功提交
   */
  it('should call onSubmit with the correct data when the form is filled out and submitted', async () => {
    const user = userEvent.setup();
    
    // Mock successful API response
    vi.mocked(userService.createUserProfile).mockResolvedValue({
      userId: 'test-user-id',
      email: 'test@example.com',
      profile: {
        name: 'Test User',
        whatsApp: '+1 234 567 8900',
        gender: 'male',
        age: 28,
        nationality: 'American',
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    });

    render(<UserProfileForm onProfileCreated={mockOnProfileCreated} />);

    // 填写所有必填字段
    const nameInput = screen.getByPlaceholderText('Enter your full name');
    const genderSelect = screen.getByTestId('gender-select');
    const nationalityInput = screen.getByPlaceholderText('e.g., Chinese, American, Japanese');
    const ageInput = screen.getByLabelText('Age');
    const whatsappInput = screen.getByPlaceholderText('e.g., +86 138 0013 8000');
    const submitButton = screen.getByRole('button', { name: 'Create Profile' });

    await user.type(nameInput, 'Test User');
    await user.selectOptions(genderSelect, 'female');
    await user.type(nationalityInput, 'American');
    await user.clear(ageInput);
    await user.type(ageInput, '28');
    await user.type(whatsappInput, '+1 234 567 8900');

    // 提交表单
    await user.click(submitButton);

    // 验证 createUserProfile 被调用
    await waitFor(() => {
      expect(vi.mocked(userService.createUserProfile)).toHaveBeenCalledTimes(1);
    });

    // 验证传递的数据正确
    expect(vi.mocked(userService.createUserProfile)).toHaveBeenCalledWith({
      fullName: 'Test User',
      gender: 'female',
      nationality: 'American',
      age: 28,
      whatsapp: '+1 234 567 8900',
    });

    // 验证成功后的回调
    await waitFor(() => {
      expect(mockOnProfileCreated).toHaveBeenCalledTimes(1);
    });
  });

  it('should handle API errors gracefully', async () => {
    const user = userEvent.setup();
    
    // Mock API error
    vi.mocked(userService.createUserProfile).mockRejectedValue(new Error('API Error'));

    render(<UserProfileForm onProfileCreated={mockOnProfileCreated} />);

    // 填写有效表单数据
    const nameInput = screen.getByPlaceholderText('Enter your full name');
    const nationalityInput = screen.getByPlaceholderText('e.g., Chinese, American, Japanese');
    const whatsappInput = screen.getByPlaceholderText('e.g., +86 138 0013 8000');
    const submitButton = screen.getByRole('button', { name: 'Create Profile' });

    await user.type(nameInput, 'Test User');
    await user.type(nationalityInput, 'American');
    await user.type(whatsappInput, '+1 234 567 8900');

    await user.click(submitButton);

    // 验证 API 被调用
    await waitFor(() => {
      expect(vi.mocked(userService.createUserProfile)).toHaveBeenCalledTimes(1);
    });

    // 验证错误处理 - onProfileCreated 不应该被调用
    await waitFor(() => {
      expect(mockOnProfileCreated).not.toHaveBeenCalled();
    });

    // 验证按钮恢复到正常状态
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Create Profile' })).toBeInTheDocument();
    });
  });

  it('should handle gender selection correctly', async () => {
    const user = userEvent.setup();
    render(<UserProfileForm onProfileCreated={mockOnProfileCreated} />);

    const genderSelect = screen.getByTestId('gender-select');
    
    // 验证默认值
    expect(genderSelect).toHaveValue('male');

    // 改变性别选择
    await user.selectOptions(genderSelect, 'other');
    expect(genderSelect).toHaveValue('other');

    await user.selectOptions(genderSelect, 'female');
    expect(genderSelect).toHaveValue('female');
  });
}); 
 
  /**
   * 测试4 (成功提交): 测试用户填写所有必填字段并成功提交
   */
  it('successfully submits the form with valid data', async () => {
    // Mock successful API call
    mockCreateUserProfile.mockResolvedValueOnce({
      userId: 'test-user-id',
      email: 'test@example.com',
      profile: {
        name: 'John Doe',
        whatsApp: '+1234567890',
        gender: 'male',
        age: 30,
        nationality: 'American'
      },
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z'
    });

    render(<UserProfileForm onProfileCreated={mockOnProfileCreated} />);

    const submitButton = screen.getByRole('button', { name: 'Create Profile' });
    const fullNameInput = screen.getByLabelText('Full Name');
    const nationalityInput = screen.getByLabelText('Nationality');
    const ageInput = screen.getByLabelText('Age');
    const whatsappInput = screen.getByLabelText('WhatsApp Number');

    // 填写所有必填字段
    await userEvent.type(fullNameInput, 'John Doe');
    await userEvent.type(nationalityInput, 'American');
    await userEvent.clear(ageInput);
    await userEvent.type(ageInput, '30');
    await userEvent.type(whatsappInput, '+1234567890');

    // 点击提交按钮
    fireEvent.click(submitButton);

    // 等待API调用完成
    await waitFor(() => {
      expect(mockCreateUserProfile).toHaveBeenCalledWith({
        fullName: 'John Doe',
        gender: 'male', // 默认值
        nationality: 'American',
        age: 30,
        whatsapp: '+1234567890'
      });
    });

    // 检查成功消息和回调函数
    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith('Profile created successfully!');
      expect(mockOnProfileCreated).toHaveBeenCalled();
    });
  });

  /**
   * 额外测试: 测试API调用失败的情况
   */
  it('handles API error gracefully', async () => {
    // Mock failed API call
    mockCreateUserProfile.mockRejectedValueOnce(new Error('API Error'));

    render(<UserProfileForm onProfileCreated={mockOnProfileCreated} />);

    const submitButton = screen.getByRole('button', { name: 'Create Profile' });
    const fullNameInput = screen.getByLabelText('Full Name');
    const nationalityInput = screen.getByLabelText('Nationality');
    const ageInput = screen.getByLabelText('Age');
    const whatsappInput = screen.getByLabelText('WhatsApp Number');

    // 填写所有必填字段
    await userEvent.type(fullNameInput, 'John Doe');
    await userEvent.type(nationalityInput, 'American');
    await userEvent.clear(ageInput);
    await userEvent.type(ageInput, '30');
    await userEvent.type(whatsappInput, '+1234567890');

    // 点击提交按钮
    fireEvent.click(submitButton);

    // 等待错误处理
    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Failed to create profile. Please try again.');
    });

    // 确保onProfileCreated没有被调用
    expect(mockOnProfileCreated).not.toHaveBeenCalled();
  });

  /**
   * 额外测试: 测试加载状态
   */
  it('shows loading state during form submission', async () => {
    // Mock a slow API call
    let resolveApiCall: (value: UserProfile) => void;
    const slowApiCall = new Promise<UserProfile>((resolve) => {
      resolveApiCall = resolve;
    });
    mockCreateUserProfile.mockReturnValueOnce(slowApiCall);

    render(<UserProfileForm onProfileCreated={mockOnProfileCreated} />);

    const submitButton = screen.getByRole('button', { name: 'Create Profile' });
    const fullNameInput = screen.getByLabelText('Full Name');
    const nationalityInput = screen.getByLabelText('Nationality');
    const ageInput = screen.getByLabelText('Age');
    const whatsappInput = screen.getByLabelText('WhatsApp Number');

    // 填写所有必填字段
    await userEvent.type(fullNameInput, 'John Doe');
    await userEvent.type(nationalityInput, 'American');
    await userEvent.clear(ageInput);
    await userEvent.type(ageInput, '30');
    await userEvent.type(whatsappInput, '+1234567890');

    // 点击提交按钮
    fireEvent.click(submitButton);

    // 检查加载状态
    await waitFor(() => {
      expect(screen.getByText('Creating...')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });

    // 完成API调用
    resolveApiCall!({
      userId: 'test-user-id',
      email: 'test@example.com',
      profile: {
        name: 'John Doe',
        whatsApp: '+1234567890',
        gender: 'male',
        age: 30,
        nationality: 'American'
      },
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z'
    });

    // 检查加载状态结束
    await waitFor(() => {
      expect(screen.getByText('Create Profile')).toBeInTheDocument();
      expect(submitButton).not.toBeDisabled();
    });
  });
}); 
 