
// Servicio de Analíticas Alternativo
// Usa estructura existente de base de datos

class AlternativeAnalyticsService {
  constructor(supabase) {
    this.supabase = supabase;
  }

  async getMessageAnalysis(limit = 50) {
    try {
      // Intentar usar message_analysis si existe
      const { data, error } = await this.supabase
        .from('message_analysis')
        .select('*')
        .limit(limit);
      
      if (!error) return data;
      
      // Alternativa: usar user_tokens_usage
      const { data: altData, error: altError } = await this.supabase
        .from('user_tokens_usage')
        .select('*')
        .eq('usage_type', 'message_analysis')
        .limit(limit);
      
      if (altError) throw altError;
      
      // Transformar datos al formato esperado
      return altData.map(item => ({
        id: item.id,
        original_message: item.metadata?.original_message,
        optimized_message: item.metadata?.optimized_message,
        channel: item.metadata?.channel,
        engagement_prediction: item.metadata?.engagement_prediction,
        optimizations: item.metadata?.optimizations,
        created_at: item.created_at
      }));
    } catch (error) {
      console.error('Error obteniendo análisis:', error);
      return [];
    }
  }

  async getEmployeeAnalytics() {
    try {
      const { data: employees, error } = await this.supabase
        .from('users')
        .select('*')
        .eq('is_active', true);
      
      if (error) throw error;
      
      // Transformar datos de empleados
      return employees.map(emp => {
        let department = 'Sin departamento';
        let position = 'Sin posición';
        let phone = 'Sin teléfono';
        
        // Extraer información de avatar_url si contiene JSON
        if (emp.avatar_url && emp.avatar_url.startsWith('{')) {
          try {
            const extraInfo = JSON.parse(emp.avatar_url);
            department = extraInfo.department || department;
            position = extraInfo.position || position;
            phone = extraInfo.phone || phone;
          } catch (e) {
            // Ignorar error de JSON
          }
        }
        
        return {
          id: emp.id,
          name: emp.full_name || emp.name || 'Sin nombre',
          email: emp.email,
          department,
          position,
          phone,
          status: emp.is_active ? 'active' : 'inactive',
          created_at: emp.created_at
        };
      });
    } catch (error) {
      console.error('Error obteniendo analíticas de empleados:', error);
      return [];
    }
  }

  async saveMessageAnalysis(analysisData) {
    try {
      // Intentar usar message_analysis si existe
      const { data, error } = await this.supabase
        .from('message_analysis')
        .insert(analysisData)
        .select('id')
        .single();
      
      if (!error) return data;
      
      // Alternativa: usar user_tokens_usage
      const { data: altData, error: altError } = await this.supabase
        .from('user_tokens_usage')
        .insert({
          user_id: analysisData.user_id,
          tokens_used: analysisData.tokens_used || 100,
          usage_type: 'message_analysis',
          metadata: analysisData,
          created_at: new Date().toISOString()
        })
        .select('id')
        .single();
      
      if (altError) throw altError;
      return altData;
    } catch (error) {
      console.error('Error guardando análisis:', error);
      throw error;
    }
  }
}

export { AlternativeAnalyticsService };
