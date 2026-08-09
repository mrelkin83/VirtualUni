import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  AlertCircle,
  Users,
  Phone,
  Mail,
  X,
} from 'lucide-react';
import { hrApi, EmployeeCreateDto } from '../../../api/endpoints/hr';
import type { Employee } from '../../../types/admin.types';

export const RecursosHumanosSection: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<EmployeeCreateDto>({
    nombre: '',
    identificacion: '',
    email: '',
    telefono: '',
    cargo: '',
    departamento: '',
    fechaIngreso: new Date().toISOString().split('T')[0],
    tipoContrato: 'indefinido',
    salario: 0,
    estado: 'activo',
    direccion: '',
    fechaNacimiento: '',
    genero: 'otro',
    estadoCivil: 'soltero',
    contactoEmergenciaNombre: '',
    contactoEmergenciaTelefono: '',
    contactoEmergenciaRelacion: '',
  });

  // Cargar empleados
  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setError(null);
      const response = await hrApi.employees.getAll({
        search: searchTerm || undefined,
        departamento: departmentFilter || undefined,
      });
      setEmployees((response as any).data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar empleados');
      console.error('Error loading employees:', err);
    } finally {
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadEmployees();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, departmentFilter]);

  const handleOpenModal = (employee?: Employee) => {
    if (employee) {
      setEditingId(employee.id as any);
      setFormData({
        nombre: employee.nombre,
        identificacion: employee.identificacion,
        email: employee.email,
        telefono: employee.telefono,
        cargo: employee.cargo,
        departamento: employee.departamento,
        fechaIngreso: employee.fechaIngreso,
        tipoContrato: employee.tipoContrato,
        salario: employee.salario,
        estado: employee.estado,
        direccion: employee.direccion,
        fechaNacimiento: employee.fechaNacimiento,
        genero: employee.genero,
        estadoCivil: employee.estadoCivil,
        contactoEmergenciaNombre: employee.contactoEmergencia.nombre,
        contactoEmergenciaTelefono: employee.contactoEmergencia.telefono,
        contactoEmergenciaRelacion: employee.contactoEmergencia.relacion,
      });
    } else {
      setEditingId(null);
      setFormData({
        nombre: '',
        identificacion: '',
        email: '',
        telefono: '',
        cargo: '',
        departamento: '',
        fechaIngreso: new Date().toISOString().split('T')[0],
        tipoContrato: 'indefinido',
        salario: 0,
        estado: 'activo',
        direccion: '',
        fechaNacimiento: '',
        genero: 'otro',
        estadoCivil: 'soltero',
        contactoEmergenciaNombre: '',
        contactoEmergenciaTelefono: '',
        contactoEmergenciaRelacion: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await hrApi.employees.update(editingId, formData);
      } else {
        await hrApi.employees.create(formData);
      }
      await loadEmployees();
      handleCloseModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar empleado');
      console.error('Error saving employee:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este empleado?')) return;

    try {
      await hrApi.employees.delete(id);
      await loadEmployees();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar empleado');
      console.error('Error deleting employee:', err);
    }
  };

  const getStateColor = (state: string) => {
    const colors: Record<string, string> = {
      activo: 'bg-green-100 text-green-800',
      inactivo: 'bg-gray-100 text-gray-800',
      vacaciones: 'bg-blue-100 text-blue-800',
      incapacidad: 'bg-yellow-100 text-yellow-800',
    };
    return colors[state] || 'bg-gray-100 text-gray-800';
  };

  const getContractTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      indefinido: 'Indefinido',
      fijo: 'Fijo',
      prestacion: 'Prestación',
      pasantia: 'Pasantía',
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">Recursos Humanos</h2>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5" />
          Nuevo Empleado
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Total de Empleados</div>
              <div className="text-3xl font-bold text-gray-900 mt-2">
                {employees.length}
              </div>
            </div>
            <Users className="w-8 h-8 text-blue-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Empleados Activos</div>
          <div className="text-3xl font-bold text-green-600 mt-2">
            {employees.filter((e) => e.estado === 'activo').length}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">De Vacaciones</div>
          <div className="text-3xl font-bold text-blue-600 mt-2">
            {employees.filter((e) => e.estado === 'vacaciones').length}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">En Incapacidad</div>
          <div className="text-3xl font-bold text-yellow-600 mt-2">
            {employees.filter((e) => e.estado === 'incapacidad').length}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar empleados..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <input
          type="text"
          placeholder="Filtrar por departamento..."
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Teléfono
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Cargo
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Departamento
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Tipo Contrato
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    No hay empleados registrados
                  </td>
                </tr>
              ) : (
                employees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {employee.nombre}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {employee.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {employee.telefono}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{employee.cargo}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {employee.departamento}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">
                        {getContractTypeLabel(employee.tipoContrato)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStateColor(employee.estado)}`}>
                        {employee.estado.charAt(0).toUpperCase() + employee.estado.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(employee)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Editar"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(employee.id as any)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Eliminar"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                {editingId ? 'Editar Empleado' : 'Nuevo Empleado'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Información Personal */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Información Personal
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.nombre}
                      onChange={(e) =>
                        setFormData({ ...formData, nombre: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Identificación *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.identificacion}
                      onChange={(e) =>
                        setFormData({ ...formData, identificacion: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha de Nacimiento *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.fechaNacimiento}
                      onChange={(e) =>
                        setFormData({ ...formData, fechaNacimiento: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.telefono}
                      onChange={(e) =>
                        setFormData({ ...formData, telefono: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Género *
                    </label>
                    <select
                      required
                      value={formData.genero}
                      onChange={(e) =>
                        setFormData({ ...formData, genero: e.target.value as any })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="masculino">Masculino</option>
                      <option value="femenino">Femenino</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estado Civil *
                    </label>
                    <select
                      required
                      value={formData.estadoCivil}
                      onChange={(e) =>
                        setFormData({ ...formData, estadoCivil: e.target.value as any })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="soltero">Soltero</option>
                      <option value="casado">Casado</option>
                      <option value="union_libre">Unión Libre</option>
                      <option value="divorciado">Divorciado</option>
                      <option value="viudo">Viudo</option>
                    </select>
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dirección *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.direccion}
                      onChange={(e) =>
                        setFormData({ ...formData, direccion: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Información Laboral */}
              <div className="border-t pt-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Información Laboral
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cargo *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.cargo}
                      onChange={(e) =>
                        setFormData({ ...formData, cargo: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Departamento *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.departamento}
                      onChange={(e) =>
                        setFormData({ ...formData, departamento: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Salario *
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.salario}
                      onChange={(e) =>
                        setFormData({ ...formData, salario: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha de Ingreso *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.fechaIngreso}
                      onChange={(e) =>
                        setFormData({ ...formData, fechaIngreso: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Contrato *
                    </label>
                    <select
                      required
                      value={formData.tipoContrato}
                      onChange={(e) =>
                        setFormData({ ...formData, tipoContrato: e.target.value as any })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="indefinido">Indefinido</option>
                      <option value="fijo">Fijo</option>
                      <option value="prestacion">Prestación</option>
                      <option value="pasantia">Pasantía</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estado *
                    </label>
                    <select
                      required
                      value={formData.estado}
                      onChange={(e) =>
                        setFormData({ ...formData, estado: e.target.value as any })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="activo">Activo</option>
                      <option value="inactivo">Inactivo</option>
                      <option value="vacaciones">Vacaciones</option>
                      <option value="incapacidad">Incapacidad</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Contacto de Emergencia */}
              <div className="border-t pt-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Contacto de Emergencia
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.contactoEmergenciaNombre}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contactoEmergenciaNombre: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.contactoEmergenciaTelefono}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contactoEmergenciaTelefono: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Relación *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.contactoEmergenciaRelacion}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contactoEmergenciaRelacion: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  {editingId ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecursosHumanosSection;
