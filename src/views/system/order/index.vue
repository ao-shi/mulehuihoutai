<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="积分商品" prop="goodsId">
        <el-input
          v-model="queryParams.goodsId"
          placeholder="请输入积分商品"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="兑换数量" prop="num">
        <el-input
          v-model="queryParams.num"
          placeholder="请输入兑换数量"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="商品名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入商品名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="总价" prop="amount">
        <el-input
          v-model="queryParams.amount"
          placeholder="请输入总价"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="发货状态" prop="status" style="width: 180px">
        <el-select v-model="queryParams.status" placeholder="请选择" clearable>
          <el-option
            v-for="dict in integral_order_status"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="收货人姓名" prop="username" label-width="108px">
        <el-input
          v-model="queryParams.username"
          placeholder="请输入收货人姓名"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="收货人手机" prop="mobile" label-width="108px">
        <el-input
          v-model="queryParams.mobile"
          placeholder="请输入收货人手机"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="收货地址" prop="address">
        <el-input
          v-model="queryParams.address"
          placeholder="请输入收货地址"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="发货时间" prop="sendTime">
        <el-input
          v-model="queryParams.sendTime"
          placeholder="请输入发货时间"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="物流公司" prop="express">
        <el-input
          v-model="queryParams.express"
          placeholder="请输入物流公司"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="物流单号" prop="expressNo">
        <el-input
          v-model="queryParams.expressNo"
          placeholder="请输入物流单号"
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
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:order:remove']"
        >批量删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['system:order:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="orderList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column type="index" :index="1" label="ID" align="center" prop="id" />
      <el-table-column label="商品名称" align="center" prop="name" />
      <el-table-column label="总价" align="center" prop="amount" />
      <el-table-column label="发货状态" align="center" prop="status" width="80">
        <template #default="scope">
          <!-- <dict-tag :options="integral_order_status" :value="scope.row.status"/> -->
          <el-tag type="primary" v-show="scope.row.status == 1">待发货</el-tag>
          <el-tag type="warning" v-show="scope.row.status == 2">待收货</el-tag>
          <el-tag type="success" v-show="scope.row.status == 3">已完成</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="收货人姓名" align="center" prop="username" width="108px"/>
      <el-table-column label="收货人手机" align="center" prop="mobile" width="120"/>
      <el-table-column label="收货地址" align="center" prop="address" width="180" show-overflow-tooltip/>
      <el-table-column label="订单备注" align="center" prop="remark" show-overflow-tooltip/>
      <el-table-column label="发货时间" align="center" prop="sendTime"/>
      <el-table-column label="物流公司" align="center" prop="express" />
      <el-table-column label="物流单号" align="center" prop="expressNo" />
      <el-table-column label="确认收货时间" align="center" prop="confirmTime" width="108px"/>
      <el-table-column label="添加时间" align="center" prop="createTime" width="100">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="修改时间" align="center" prop="updateTime" width="100">
        <template #default="scope">
          <span>{{ parseTime(scope.row.updateTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="updateAddress(scope.row)" v-hasPermi="['system:order:edit']">收货信息</el-button>
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:order:edit']" v-show="scope.row.status == 1">发货</el-button>
          <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:order:remove']">删除</el-button>
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

    <!-- 发货对话框 -->
    <el-dialog title="发货" v-model="open" width="500px" append-to-body>
      <el-form ref="addressRef" :model="form" label-width="80px" :rules="rules">
        <el-form-item label="物流编码" prop="express">
          <el-input v-model="form.express" type="text" placeholder="请输入物流编码" clearable :style="{width: '100%'}"></el-input>
        </el-form-item>
        <el-form-item label="物流编号" prop="expressNo">
          <el-input v-model="form.expressNo" type="text" placeholder="请输入物流编号" clearable :style="{width: '100%'}"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 收货信息对话框 -->
    <el-dialog v-model="userOpen" title="收货信息" @close="resetUserForm">
      <el-form ref="formRef" :model="userForm" :rules="userRules" size="default" label-width="100px">
        <el-form-item label="收货人姓名" prop="username">
          <el-input v-model="userForm.username" placeholder="请输入收货人姓名" :style="{width: '100%'}"></el-input>
        </el-form-item>
        <el-form-item label="收货地址" prop="address">
          <el-input v-model="userForm.address" placeholder="请输入收货地址" clearable :style="{width: '100%'}"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="userForm.mobile" placeholder="请输入手机号" :maxlength="11" show-word-limit clearable :style="{width: '100%'}"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="cancel">取消</el-button>
        <el-button type="primary" @click="handelConfirm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Order">
import { listOrder, getOrder, delOrder, updateOrder } from "@/api/system/order";
import { ref, reactive, toRefs } from "vue";

const { proxy } = getCurrentInstance();
const { integral_order_status } = proxy.useDict('integral_order_status');

const orderList = ref([]);
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

const userForm = ref({
  mobile: null,
  username: null,
  address: null
});
const userRules = ref({
  mobile: [{ required: true, message: "请输入手机号", trigger: "blur" }],
  username: [{ required: true, message: "请输入收货人姓名", trigger: "blur" }],
  address: [{ required: true, message: "请输入收货地址", trigger: "blur" }]
});

const userOpen = ref(false);
const updateAddress = (row) => {
  userForm.value = { ...row };
  console.log(userForm.value);
  
  userOpen.value = true;
};

const resetUserForm = () => {
  proxy.$refs.formRef.resetFields();
};

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    orderNo: null,
    goodsId: null,
    num: null,
    name: null,
    amount: null,
    status: null,
    username: null,
    mobile: null,
    address: null,
    sendTime: null,
    express: null,
    expressNo: null,
    createTime: null,
    updateTime: null
  },
  rules: {
    express: [{ required: true, message: "请输入物流编码", trigger: "blur" }],
    expressNo: [{ required: true, message: "请输入物流编号", trigger: "blur" }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询积分订单列表 */
function getList() {
  loading.value = true;
  queryParams.value.params = {};
  if (daterangeCreateTime.value.length) {
    queryParams.value.params["beginCreateTime"] = daterangeCreateTime.value[0];
    queryParams.value.params["endCreateTime"] = daterangeCreateTime.value[1];
  }
  if (daterangeUpdateTime.value.length) {
    queryParams.value.params["beginUpdateTime"] = daterangeUpdateTime.value[0];
    queryParams.value.params["endUpdateTime"] = daterangeUpdateTime.value[1];
  }
  listOrder(queryParams.value).then(response => {
    orderList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

// 取消按钮
function cancel() {
  open.value = false;
  userOpen.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
    id: null,
    userId: null,
    orderNo: null,
    goodsId: null,
    num: null,
    goodImage: null,
    name: null,
    amount: null,
    status: null,
    username: null,
    mobile: null,
    address: null,
    remark: null,
    sendTime: null,
    express: null,
    expressNo: null,
    confirmTime: null,
    addressData: null,
    createTime: null,
    updateTime: null
  };
  proxy.resetForm("addressRef");
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
  title.value = "添加积分订单";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value;
  getOrder(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "发货";
  });
}


// 收货信息的确定
const handelConfirm = async()=>{

  const res = await updateOrder(userForm.value);
  console.log('修改收货信息',res);
  if(res.code === 200){
    userOpen.value = false;
    proxy.$message.success('修改成功');
    getList();
  }
    
}

/** 提交按钮 */
function submitForm() {
  const params = {
    id: form.value.id,
    express: form.value.express,
    expressNo: form.value.expressNo,
    status: 2
  };
  proxy.$refs["addressRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateOrder(params).then(response => {
          proxy.$modal.msgSuccess("修改成功");
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
  proxy.$modal.confirm('是否确认删除积分订单编号为"' + _ids + '"的数据项？').then(function() {
    return delOrder(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('system/order/export', {
    ...queryParams.value
  }, `order_${new Date().getTime()}.xlsx`)
}

getList();
</script>
