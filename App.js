import React, { useState } from "react";
import {
  Layout, Table, Input, Select, Row, Col, Card,
  Upload, Button, Progress, Tag, Statistic, Modal
} from "antd";
import { UploadOutlined, CheckCircleTwoTone, ExclamationCircleTwoTone } from "@ant-design/icons";
import Papa from "papaparse";
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  LineChart, Line, CartesianGrid
} from "recharts";
import Chatbot from "./components/chatBot"


const { Header, Content } = Layout;
const { Option } = Select;
const { Search } = Input;

const initialData = [
  {
    valueStream: "Benefits and Pricing",
    subStream: "Benefits Journey",
    projectName: "PRjej",
    valueStreamLead: "Eric",
    engineeringManager: "Susan",
    taskName: "Benefits strategy",
    resourceCount: 8,
    weeklyHours: 22,
    montlyHours: 40,
    quaterlyHours: 80,
    catagaory: "Capex",
    target: 67,
    achieved: 40,
  },
  {
    valueStream: "AOR",
    subStream: "CLM",
    projectName: "PRjejewew",
    valueStreamLead: "Eff",
    engineeringManager: "Ttn",
    taskName: "CLM",
    resourceCount: 4,
    weeklyHours: 20,
    montlyHours: 38,
    quaterlyHours: 50,
    catagaory: "Opex",
    target: 75,
    achieved: 80,
  },
  {
    valueStream: "Customer Experience",
    subStream: "Onboarding",
    projectName: "OnboardX",
    valueStreamLead: "Alice",
    engineeringManager: "John",
    taskName: "Onboarding Flow",
    resourceCount: 10,
    weeklyHours: 28,
    montlyHours: 50,
    quaterlyHours: 100,
    catagaory: "Capex",
    target: 60,
    achieved: 55,
  },
  {
    valueStream: "Payments",
    subStream: "Billing",
    projectName: "PayTrack",
    valueStreamLead: "David",
    engineeringManager: "Sophia",
    taskName: "Payment Gateway",
    resourceCount: 6,
    weeklyHours: 18,
    montlyHours: 42,
    quaterlyHours: 75,
    catagaory: "Opex",
    target: 90,
    achieved: 30,
  },
];

export default function Dashboard() {
  const [data, setData] = useState(initialData);
  const [searchText, setSearchText] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterValueStream, setFilterValueStream] = useState("");
  const [filterSubStream, setFilterSubStream] = useState("");
  const [riskModalVisible, setRiskModalVisible] = useState(false);

  // JSON import modal state
  const [jsonModalVisible, setJsonModalVisible] = useState(false);
  const [jsonInput, setJsonInput] = useState("");

  const COLORS = ["#0088FE", "#FF8042", "#00C49F", "#FFBB28"];

  // KPI Stats
  const totalProjects = data.length;
  const capexProjects = data.filter((d) => d.catagaory === "Capex").length;
  const opexProjects = data.filter((d) => d.catagaory === "Opex").length;
  const atRiskProjects = data.filter((d) => d.achieved < d.target).length;

  // Pie chart data
  const pieData = [
    { name: "Capex", value: capexProjects },
    { name: "Opex", value: opexProjects },
  ];

  // Bar chart data
  const barData = data.map((d) => ({
    project: d.projectName,
    resources: d.resourceCount,
  }));

  // Line chart data
  const lineData = data.map((d) => ({
    project: d.projectName,
    Weekly: d.weeklyHours,
    Monthly: d.montlyHours,
    Quarterly: d.quaterlyHours,
  }));

  // Filters
  const filteredData = data.filter(
    (item) =>
      item.projectName.toLowerCase().includes(searchText.toLowerCase()) &&
      (filterCategory ? item.catagaory === filterCategory : true) &&
      (filterValueStream ? item.valueStream === filterValueStream : true) &&
      (filterSubStream ? item.subStream === filterSubStream : true)
  );

  // CSV upload handler
  const handleCSVUpload = (file) => {
    Papa.parse(file, {
      header: true,
      complete: (result) => {
        const parsedData = result.data.map((d) => ({
          ...d,
          resourceCount: Number(d.resourceCount),
          weeklyHours: Number(d.weeklyHours),
          montlyHours: Number(d.montlyHours),
          quaterlyHours: Number(d.quaterlyHours),
          target: Number(d.target),
          achieved: Number(d.achieved),
        }));
        setData([...data, ...parsedData]);
      },
    });
    return false;
  };

  // JSON submit from modal
  const handleJsonSubmit = async () => {
    try {
      const parsed = JSON.parse(jsonInput);
      if (!Array.isArray(parsed)) {
        Modal.error({ title: "Invalid JSON", content: "Please provide an array of objects." });
        return;
      }

      setData([...data, ...parsed]);

      // Example API post (replace with your API)
      await fetch("http://localhost:8000/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      });

      Modal.success({ title: "Success", content: "JSON data imported & posted to API." });
      setJsonModalVisible(false);
      setJsonInput("");
    } catch (err) {
      Modal.error({ title: "Error", content: "Invalid JSON format." });
    }
  };

  const columns = [
    { title: "Project Name", dataIndex: "projectName" },
    { title: "Value Stream", dataIndex: "valueStream" },
    { title: "Sub Stream", dataIndex: "subStream" },
    { title: "Lead", dataIndex: "valueStreamLead" },
    { title: "Manager", dataIndex: "engineeringManager" },
    { title: "Task", dataIndex: "taskName" },
    {
      title: "Category",
      dataIndex: "catagaory",
      render: (cat) => (
        <Tag color={cat === "Capex" ? "blue" : "orange"}>{cat}</Tag>
      ),
    },
    {
      title: "Resources",
      dataIndex: "resourceCount",
    },
    {
      title: "Target vs Achieved",
      render: (_, record) => {
        const percent = Math.round((record.achieved / record.target) * 100);
        const isSuccess = record.achieved >= record.target;
        return (
          <div style={{ minWidth: 120 }}>
            <Progress
              percent={percent}
              status={isSuccess ? "success" : "exception"}
              strokeColor={isSuccess ? "#52c41a" : "#ff4d4f"}
            />
            <Tag color={isSuccess ? "green" : "red"}>
              {isSuccess ? (
                <><CheckCircleTwoTone twoToneColor="#52c41a" /> On Track</>
              ) : (
                <><ExclamationCircleTwoTone twoToneColor="#ff4d4f" /> At Risk</>
              )}
            </Tag>
          </div>
        );
      },
    },
  ];

  // Unique ValueStreams & SubStreams
  const uniqueValueStreams = [...new Set(data.map((d) => d.valueStream))];
  const subStreamsForSelectedVS = data
    .filter((d) => !filterValueStream || d.valueStream === filterValueStream)
    .map((d) => d.subStream);
  const uniqueSubStreams = [...new Set(subStreamsForSelectedVS)];

  // At-risk projects
  const riskProjects = data.filter((d) => d.achieved < d.target);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* App Bar */}
      <Header style={{ background: "#001529", color: "#fff" }}>
        <h2 style={{ color: "#fff", margin: 0 }}>📊 Capex & Opex Dashboard</h2>
      </Header>

      <Content style={{ padding: 24 }}>
        {/* Upload Buttons */}
        <Row gutter={16} style={{ marginBottom: 20 }}>
          <Col>
            <Upload beforeUpload={handleCSVUpload} showUploadList={false}>
              <Button icon={<UploadOutlined />}>Upload CSV</Button>
            </Upload>
          </Col>
          <Col>
            <Button icon={<UploadOutlined />} onClick={() => setJsonModalVisible(true)}>
              Import JSON
            </Button>
          </Col>
        </Row>

        {/* KPI Summary */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card style={{ background: "#1890ff", color: "#fff" }}>
              <Statistic title="Total Projects" value={totalProjects} />
            </Card>
          </Col>
          <Col span={6}>
            <Card style={{ background: "#52c41a", color: "#fff" }}>
              <Statistic title="Capex Projects" value={capexProjects} />
            </Card>
          </Col>
          <Col span={6}>
            <Card style={{ background: "#faad14", color: "#fff" }}>
              <Statistic title="Opex Projects" value={opexProjects} />
            </Card>
          </Col>
          <Col span={6}>
            <Card
              style={{ background: "#ff4d4f", color: "#fff", cursor: "pointer" }}
              onClick={() => setRiskModalVisible(true)}
            >
              <Statistic title="At Risk Projects" value={atRiskProjects} />
            </Card>
          </Col>
        </Row>

        {/* Charts */}
        <Row gutter={16}>
          <Col span={8}>
            <Card title="Capex vs Opex">
              <PieChart width={300} height={300}>
                <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={120} label>
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </Card>
          </Col>
          <Col span={8}>
            <Card title="Resources per Project">
              <BarChart width={350} height={300} data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="project" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="resources" fill="#82ca9d" />
              </BarChart>
            </Card>
          </Col>
          <Col span={8}>
            <Card title="Hours Trend">
              <LineChart width={350} height={300} data={lineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="project" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Weekly" stroke="#8884d8" />
                <Line type="monotone" dataKey="Monthly" stroke="#82ca9d" />
                <Line type="monotone" dataKey="Quarterly" stroke="#ffc658" />
              </LineChart>
            </Card>
          </Col>
        </Row>
        <Chatbot />
        {/* Filters + Table */}
        <Row style={{ marginTop: 30 }}>
          <Col span={24}>
            <Card title="Project Details">
              <Row gutter={16} style={{ marginBottom: 20 }}>
                <Col span={6}>
                  <Search placeholder="Search Project" onChange={(e) => setSearchText(e.target.value)} allowClear />
                </Col>
                <Col span={6}>
                  <Select
                    placeholder="Filter by Category"
                    onChange={(value) => setFilterCategory(value)}
                    style={{ width: "100%" }}
                    allowClear
                  >
                    <Option value="Capex">Capex</Option>
                    <Option value="Opex">Opex</Option>
                  </Select>
                </Col>
                <Col span={6}>
                  <Select
                    placeholder="Filter by Value Stream"
                    onChange={(value) => {
                      setFilterValueStream(value);
                      setFilterSubStream(""); // reset substream when value stream changes
                    }}
                    style={{ width: "100%" }}
                    allowClear
                  >
                    {uniqueValueStreams.map((vs) => (
                      <Option key={vs} value={vs}>{vs}</Option>
                    ))}
                  </Select>
                </Col>
                <Col span={6}>
                  <Select
                    placeholder="Filter by Sub Stream"
                    onChange={(value) => setFilterSubStream(value)}
                    style={{ width: "100%" }}
                    allowClear
                    value={filterSubStream || undefined}
                  >
                    {uniqueSubStreams.map((ss) => (
                      <Option key={ss} value={ss}>{ss}</Option>
                    ))}
                  </Select>
                </Col>
              </Row>
              <Table columns={columns} dataSource={filteredData} rowKey="projectName" pagination={{ pageSize: 5 }} />
            </Card>
          </Col>
        </Row>

        {/* Modal for At Risk Projects */}
        <Modal
          title="At Risk Projects"
          open={riskModalVisible}
          onCancel={() => setRiskModalVisible(false)}
          footer={null}
          width={800}
        >
          <Table columns={columns} dataSource={riskProjects} rowKey="projectName" pagination={false} />
        </Modal>

        {/* JSON Import Modal */}
        <Modal
          title="Import JSON Data"
          open={jsonModalVisible}
          onCancel={() => setJsonModalVisible(false)}
          onOk={handleJsonSubmit}
          okText="Submit"
          width={600}
        >
          <p>Paste your JSON array here:</p>
          <Input.TextArea
            rows={8}
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder='[ { "projectName": "Demo", "valueStream": "Payments", "subStream": "Billing", "catagaory": "Capex", "target": 80, "achieved": 60 } ]'
          />
        </Modal>
      </Content>
    </Layout>
  );
}
