import React, { useState } from 'react';
import './AiFormGenerator.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosClient from '../../services/axiosClient';
import { AuthContext } from '../../contexts/AuthContext';
import { FiUpload, FiLoader, FiCopy, FiCheckCircle, FiFileText } from 'react-icons/fi';
import { QRCodeSVG } from 'qrcode.react';
import { useGoogleLogin } from '@react-oauth/google';
import { HelpPanel, HelpSteps, HelpTip, HelpWarning } from '../../components/ui/HelpPanel';

const JSON_TEMPLATE = `{
  "title": "Tên biểu mẫu của bạn",
  "description": "Mô tả biểu mẫu",
  "items": [
    {
      "title": "Bạn là sinh viên hay người đi làm?",
      "type": "RADIO",
      "required": true,
      "options": [
        { "value": "Sinh viên", "goto_section": "sec_sinhvien" },
        { "value": "Người đi làm", "goto_action": "SUBMIT_FORM" }
      ]
    },
    {
      "section_id": "sec_sinhvien",
      "type": "SECTION",
      "title": "Dành cho Sinh Viên"
    },
    {
      "title": "Bạn học chuyên ngành gì?",
      "type": "TEXT",
      "required": false
    }
  ]
}`;

const PROMPT_TEMPLATE = `Bạn là một chuyên gia tạo Google Form. Dựa vào yêu cầu sau: "[CHÈN YÊU CẦU CỦA BẠN VÀO ĐÂY]", hãy tạo một cấu trúc Form chi tiết dưới dạng JSON.

QUY TẮC BẮT BUỘC:
1. Trường "type" CHỈ ĐƯỢC PHÉP sử dụng 1 trong 6 từ khóa chính xác sau (TUYỆT ĐỐI KHÔNG TỰ BỊA RA LOẠI KHÁC):
   - "TEXT": Câu trả lời ngắn
   - "PARAGRAPH_TEXT": Câu trả lời dài (đoạn văn)
   - "RADIO": Trắc nghiệm chọn 1 đáp án
   - "CHECKBOX": Trắc nghiệm chọn nhiều đáp án
   - "DROP_DOWN": Menu thả xuống
   - "SECTION": Tạo Phần mới (Chuyển trang)

2. ĐIỀU HƯỚNG TRANG (Rẽ nhánh):
   - Chỉ dùng cho câu hỏi loại "RADIO" hoặc "DROP_DOWN".
   - Mảng "options" chứa các object. Dùng "goto_section": "<id>" để rẽ sang trang khác, hoặc "goto_action": "SUBMIT_FORM" để nộp form.
   - Các phần (SECTION) phải có "section_id" tương ứng để câu hỏi có thể trỏ tới.
   - Câu hỏi thông thường (TEXT, CHECKBOX) thì "options" chỉ chứa "value" (nếu có).

Cấu trúc JSON mẫu:
\${JSON_TEMPLATE}

Chỉ trả về chuỗi JSON thuần túy, không bọc trong thẻ markdown (\`\`\`json) và không giải thích gì thêm.`;

function AiFormGenerator() {
  const { user, refreshWallet } = React.useContext(AuthContext);
  const [jsonInput, setJsonInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target.result;
        // Validate JSON immediately
        JSON.parse(content);
        setJsonInput(content);
        toast.success("Đã tải file JSON thành công!");
      } catch (error) {
        toast.error("File không chứa JSON hợp lệ.");
      }
    };
    reader.readAsText(file);
  };

  const loginAndCreateForm = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      let parsedJson;
      try {
        parsedJson = JSON.parse(jsonInput);
      } catch (error) {
        toast.error("Cú pháp JSON không hợp lệ. Vui lòng kiểm tra lại.");
        return;
      }

      setLoading(true);
      setResult(null);

      try {
        const response = await axiosClient.post('/ai-tools/generate-form', {
          json_data: parsedJson,
          access_token: tokenResponse.access_token
        });

        const { formUrl, formTitle, message } = response.data;
        
        setResult({
          url: formUrl,
          title: formTitle || parsedJson.title || "Untitled Form",
          message: message
        });
        
        toast.success("Tạo Form thành công!");
        refreshWallet();
      } catch (error) {
        if (error.response?.status === 402) {
          toast.error("Số dư ví không đủ. Vui lòng nạp thêm Credits!");
        } else {
          toast.error("Lỗi: " + (error.response?.data?.error || error.message));
        }
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      toast.error("Đăng nhập Google thất bại!");
    },
    scope: 'https://www.googleapis.com/auth/forms.body https://www.googleapis.com/auth/drive'
  });

  const handleCreateFormClick = (e) => {
    e.preventDefault();
    if (!jsonInput.trim()) {
      toast.warn("Vui lòng dán nội dung JSON hoặc tải file lên!");
      return;
    }
    
    try {
      JSON.parse(jsonInput);
    } catch (error) {
      toast.error("Cú pháp JSON không hợp lệ. Vui lòng kiểm tra lại.");
      return;
    }

    // Trigger Google Login
    loginAndCreateForm();
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'prompt') {
      toast.success("Đã copy Prompt Template!");
    } else {
      toast.success("Đã copy link Form!");
    }
  };

  return (
    <div className="ai-form-page animate-slide-up">
      <ToastContainer position="bottom-right" theme="colored" />
      
      <header className="page-header">
        <h1>FORM GENERATOR</h1>
        <p>Tạo Google Form tự động từ cấu trúc JSON</p>
      </header>

      <HelpPanel defaultOpen>
        <HelpSteps steps={[
          <>Copy Prompt Template ở cột trái, dán vào AI bạn đang dùng (ChatGPT, Claude, Gemini...) kèm theo yêu cầu form của bạn — AI sẽ trả về đúng cấu trúc JSON hệ thống cần.</>,
          <>Dán JSON kết quả vào ô nhập bên phải, hoặc bấm <strong>"Upload .json"</strong> nếu đã lưu sẵn file.</>,
          <>Nhấn <strong>"Đăng nhập Google & Tạo Form"</strong> — cửa sổ Google sẽ hiện ra, yêu cầu cấp quyền tạo Form/Drive (đây là quyền của Google, tách biệt hoàn toàn với tài khoản đăng nhập vào website).</>,
          <>Sau khi tạo xong, form thật đã nằm trong Google Drive của bạn — nhận link + mã QR để chia sẻ ngay, chỉnh sửa tiếp trực tiếp trên Google Forms nếu cần.</>,
        ]} />
        <HelpTip>
          Loại câu hỏi hỗ trợ: <code>TEXT</code>, <code>PARAGRAPH_TEXT</code>, <code>RADIO</code>, <code>CHECKBOX</code>, <code>DROP_DOWN</code>, <code>SECTION</code>. Dùng <code>goto_section</code>/<code>goto_action</code> trong lựa chọn RADIO/DROP_DOWN để tạo rẽ nhánh trang.
        </HelpTip>
        <HelpWarning>
          Mỗi lần tạo form tốn 5 credit — cao hơn các tool khác vì gọi trực tiếp Google Forms API để tạo form thật (không phải bản nháp). Kiểm tra kỹ JSON trước khi tạo để tránh tốn credit cho form sai cấu trúc.
        </HelpWarning>
      </HelpPanel>

      <main className="ai-content-split">
        {/* Left Column: Instructions & Template */}
        <div className="template-card glass-panel">
          <h2>Hướng dẫn sử dụng</h2>
          <p className="instruction-text">
            Sử dụng AI của riêng bạn (ChatGPT, Claude, Gemini) để sinh cấu trúc Form. Hãy copy Prompt mẫu dưới đây và dán vào AI của bạn:
          </p>
          
          <div className="code-block-wrapper">
            <div className="code-block-header">
              <span>Prompt Template</span>
              <button className="btn-copy-sm" onClick={() => copyToClipboard(PROMPT_TEMPLATE, 'prompt')}>
                <FiCopy /> Copy
              </button>
            </div>
            <pre className="code-block">
              <code>{PROMPT_TEMPLATE}</code>
            </pre>
          </div>
          
          <p className="instruction-text" style={{marginTop: '24px'}}>
            <b>Lưu ý:</b> Hệ thống hỗ trợ các loại câu hỏi: <code>RADIO</code>, <code>CHECKBOX</code>, <code>DROP_DOWN</code>, <code>TEXT</code>, <code>PARAGRAPH_TEXT</code>.
          </p>
        </div>

        {/* Right Column: Execution */}
        <div className="execution-card glass-panel">
          <form className="execution-form">
            
            <div className="form-group">
              <label>
                Cấu trúc JSON Form
                <div className="upload-wrapper">
                  <input 
                    type="file" 
                    id="jsonUpload" 
                    accept=".json" 
                    onChange={handleFileUpload} 
                    style={{display: 'none'}} 
                  />
                  <label htmlFor="jsonUpload" className="btn-upload-sm">
                    <FiUpload /> Upload .json
                  </label>
                </div>
              </label>
              <textarea
                className="input-mc json-textarea"
                placeholder="Dán JSON vào đây..."
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                required
              />
            </div>

            <button type="button" onClick={handleCreateFormClick} className="btn-ink btn-submit-form" disabled={loading}>
              {loading ? <><FiLoader className="spin" /> Đang xử lý...</> : "Đăng nhập Google & Tạo Form (5 Credits)"}
            </button>
          </form>

          {result && (
            <div className="result-card">
              <div className="result-header">
                <FiCheckCircle color="#27c93f" size={20} />
                <h3>{result.title}</h3>
              </div>
              <div className="result-body">
                <div className="qr-wrapper">
                  <QRCodeSVG value={result.url} size={100} />
                </div>
                <div className="link-wrapper">
                  <a href={result.url} target="_blank" rel="noreferrer" className="form-link">
                    {result.url}
                  </a>
                  <button className="btn-copy" onClick={() => copyToClipboard(result.url, 'link')}>
                    <FiCopy /> Copy Link
                  </button>
                </div>
              </div>
              <div className="result-footer">
                {result.message}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default AiFormGenerator;
