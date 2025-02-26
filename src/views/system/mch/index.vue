<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="用户" prop="userId">
        <el-input
          v-model="queryParams.userId"
          placeholder="请输入用户"
          clearable
          @keyup.enter="handleQuery"/>
      </el-form-item>
      <el-form-item label="客服电话" prop="serviceTel">
        <el-input
          v-model="queryParams.serviceTel"
          placeholder="请输入客服电话"
          clearable
          @keyup.enter="handleQuery"/>
      </el-form-item>
      <el-form-item label="企业名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入企业名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="联系电话" prop="mobile">
        <el-input
          v-model="queryParams.mobile"
          placeholder="请输入联系电话"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="审核状态" prop="reviewStatus">
        <el-select v-model="queryParams.reviewStatus" placeholder="请选择审核状态:1=待审核,2=审核通过,3=审核不通过" clearable style="width: 108px;">
          <el-option
            v-for="dict in audit_status"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="审核时间" prop="reviewTime">
        <el-input
          v-model="queryParams.reviewTime"
          placeholder="请输入审核时间"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="添加时间" style="width: 308px">
        <el-date-picker
          v-model="daterangeCreateTime"
          value-format="YYYY-MM-DD"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        ></el-date-picker>
      </el-form-item>
      <el-form-item label="修改时间" style="width: 308px">
        <el-date-picker
          v-model="daterangeUpdateTime"
          value-format="YYYY-MM-DD"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        ></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['system:mch:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['system:mch:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:mch:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['system:mch:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="mchList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" align="center" prop="id" width="50px" type="index" :index="1"/>
      <el-table-column label="客服电话" align="center" prop="serviceTel" />
      <el-table-column label="企业名称" align="center" prop="name" />
      <el-table-column label="联系电话" align="center" prop="mobile" />
      <el-table-column label="审核状态" align="center" prop="reviewStatus">
        <template #default="scope">
          <el-tag v-show="scope.row.reviewStatus == 1" type="info">待审核</el-tag>
          <el-tag v-show="scope.row.reviewStatus == 2" type="success">审核通过</el-tag>
          <el-tag v-show="scope.row.reviewStatus == 3" type="danger" @click="showModa(scope.row)">审核拒绝</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="审核时间" align="center" prop="reviewTime" width="180">
        <template #default="scope">
          <span v-show="scope.row.reviewStatus != 1">{{ formatTimestamp(scope.row.reviewTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="添加时间" align="center" prop="createTime" width="108">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="修改时间" align="center" prop="updateTime" width="108">
        <template #default="scope">
          <span>{{ parseTime(scope.row.updateTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="置顶商户" align="center" prop="isTop" />
      <el-table-column label="联系人" align="center" prop="username" />
      <el-table-column label="介绍" align="center" prop="info" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="success" size="small" class="custom-small-button" @click="handleUpdate(scope.row,2)" v-show="scope.row.reviewStatus == 1">通过</el-button>
          <el-button link type="danger" size="small" class="custom-small-button" @click="openRefuseDialog(scope.row,3)" v-show="scope.row.reviewStatus == 1">拒绝</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:mch:remove']" v-show="scope.row.reviewStatus != 1">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
    
    <!-- 审核失败原因点击展示 -->
    <el-dialog title="审核拒绝原因" v-model="showModal" width="500px" append-to-body>
      <div>{{ refuseReasons }}</div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showModal = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 添加或修改商户对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="mchRef" :model="form" :rules="rules" label-width="80px">
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 拒绝操作对话框 -->
    <el-dialog title="拒绝原因" v-model="refuseDialogVisible" width="500px" append-to-body>
      <el-form ref="refuseForm" :model="refuseForm" label-width="80px">
        <el-form-item label="原因" prop="reason">
          <el-input type="input" v-model="Result" placeholder="请输入拒绝原因"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="refuseDialogVisibles">取消</el-button>
          <el-button type="primary" @click="submitRefuseForm">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Mch">
import { listMch, getMch, delMch, addMch, updateMch } from "@/api/system/mch";
import { ref, reactive, toRefs, getCurrentInstance } from "vue";

// 控制弹窗显示与隐藏的状态
const showModal = ref(false);
const refuseReasons = ref('');
async function showModa(row) {
  const res = await getMch(row.id);
  if (res.code === 200) {
    refuseReasons.value = res.data.reviewResult || '无审核拒绝原因';
    console.log(res.data.reviewResult);
    showModal.value = true;
  }
}

const { proxy } = getCurrentInstance();
const { audit_status } = proxy.useDict('audit_status');

const mchList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const daterangeCreateTime = ref([]);
const daterangeUpdateTime = ref([]);
const refuseDialogVisible = ref(false);
const refuseForm = reactive({
  id: null,
  reason: ''
});
const Result = ref('');

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    userId: null,
    serviceTel: null,
    name: null,
    mobile: null,
    reviewStatus: null,
    reviewResult: null,
    reviewTime: null,
    createTime: null,
    updateTime: null,
  },
  rules: {
    userId: [
      { required: true, message: "用户不能为空", trigger: "blur" }
    ],
    serviceTel: [
      { required: true, message: "客服电话不能为空", trigger: "blur" }
    ],
    name: [
      { required: true, message: "企业名称不能为空", trigger: "blur" }
    ],
    mobile: [
      { required: true, message: "联系电话不能为空", trigger: "blur" }
    ],
    address: [
      { required: true, message: "入驻区域不能为空", trigger: "blur" }
    ],
    licenseImages: [
      { required: true, message: "营业执照不能为空", trigger: "blur" }
    ],
    logoImage: [
      { required: true, message: "logo不能为空", trigger: "blur" }
    ],
    bgImage: [
      { required: true, message: "背景图不能为空", trigger: "blur" }
    ],
    reviewStatus: [
      { required: true, message: "审核状态:1=待审核,2=审核通过,3=审核不通过不能为空", trigger: "change" }
    ],
    reviewResult: [
      { required: true, message: "审核结果不能为空", trigger: "blur" }
    ],
    reviewTime: [
      { required: true, message: "审核时间不能为空", trigger: "blur" }
    ],
    infoAddress: [
      { required: true, message: "详细地址不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询商户列表 */
function getList() {
  loading.value = true;
  queryParams.value.params = {};
  if (null != daterangeCreateTime && '' != daterangeCreateTime) {
    queryParams.value.params["beginCreateTime"] = daterangeCreateTime.value[0];
    queryParams.value.params["endCreateTime"] = daterangeCreateTime.value[1];
  }
  if (null != daterangeUpdateTime && '' != daterangeUpdateTime) {
    queryParams.value.params["beginUpdateTime"] = daterangeUpdateTime.value[0];
    queryParams.value.params["endUpdateTime"] = daterangeUpdateTime.value[1];
  }
  listMch(queryParams.value).then(response => {
    mchList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
    id: null,
    userId: null,
    serviceTel: null,
    name: null,
    mobile: null,
    address: null,
    licenseImages: null,
    logoImage: null,
    bgImage: null,
    coverImage: null,
    reviewStatus: null,
    reviewResult: null,
    reviewTime: null,
    createTime: null,
    updateTime: null,
    infoAddress: null,
    agentId: null,
    isTop: null,
    username: null,
    info: null
  };
  proxy.resetForm("mchRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  daterangeCreateTime.value = [];
  daterangeUpdateTime.value = [];
  proxy.resetForm("queryRef");
  handleQuery();
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加商户";
}

/** 通过按钮操作 */
async function handleUpdate({id},reviewStatus) {
  const timestamp = new Date().getTime()/1000; // 获取当前系统时间的时间戳
  const res = await updateMch({id, reviewStatus, reviewTime:timestamp});
  if (res.code === 200) {
    proxy.$modal.msgSuccess("操作成功");
    getList();
  }
}

/** 打开拒绝对话框 */
function openRefuseDialog(row) {
  refuseForm.id = row.id;
  refuseForm.reason = "";
  refuseDialogVisible.value = true;
}
// 点击拒绝弹窗中的取消按钮的操作
function refuseDialogVisibles() {
  refuseDialogVisible.value = false;
  Result.value = ''; // 清空输入框内容
    getList();
}
/** 提交拒绝表单 */
async function submitRefuseForm() {
  
  const timestamp = new Date().getTime()/1000; // 获取当前系统时间的时间戳
  const res = await updateMch({id: refuseForm.id, 
    reviewStatus: 3, reviewResult: Result.value,  reviewTime:timestamp});
  if (res.code === 200) {
    proxy.$modal.msgSuccess("操作成功");
    refuseDialogVisible.value = false;
  }
  Result.value = ''; // 清空输入框内容
    getList();
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["mchRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateMch(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addMch(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _ids = row.id || ids.value;
  proxy.$modal.confirm('是否确认删除商户编号为"' + _ids + '"的数据项？').then(function() {
    return delMch(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('system/mch/export', {
    ...queryParams.value
  }, `mch_${new Date().getTime()}.xlsx`)
}

getList();
/** 格式化时间戳 */
function formatTimestamp(timestamp) {
  const date = new Date(timestamp * 1000); // 将秒转换为毫秒
  const year = date.getFullYear();
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const day = ('0' + date.getDate()).slice(-2);
  const hours = ('0' + date.getHours()).slice(-2);
  const minutes = ('0' + date.getMinutes()).slice(-2);
  const seconds = ('0' + date.getSeconds()).slice(-2);
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
</script>
<style scoped>
.modal-aoverlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.modals {
  background-color: white;
  padding: 20px;
  border-radius: 5px;
  width: 300px;
}

.button-group {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.button-group button {
  margin-left: 10px;
}
</style>
